import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import {
  BaseQuery,
  NewUserRequestBodyForProduct,
  SearchRequestQuery,
} from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.model.js";
import { rm } from "fs";
import { redisCache } from "../app.js";
import { deleteCache } from "../utils/helpers.js";

export const getAllLatestProducts = TryCatch(async (req, res, next) => {
  const latestProducts = await redisCache.get("latest-products");
  if (latestProducts) {
    const productsData = JSON.parse(latestProducts);
    return res.status(200).json({
      success: true,
      productsData,
    });
  }
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
  await redisCache.set("latest-products", JSON.stringify(products));
  return res.status(200).json({
    success: true,
    products,
  });
});
export const getAllUniqueCategories = TryCatch(async (req, res, next) => {
  const cacheCategories = await redisCache.get("categories");
  if (cacheCategories) {
    const categoriesData = JSON.parse(cacheCategories);
    return res.status(200).json({
      success: true,
      categoriesData,
    });
  }
  const categories = await Product.distinct("category");
  await redisCache.set("categories", JSON.stringify(categories));
  return res.status(200).json({
    success: true,
    categories,
  });
});
export const getAllProductsForAdmin = TryCatch(async (req, res, next) => {
  const cacheAdminProducts = await redisCache.get("admin-products");
  if (cacheAdminProducts) {
    const categoriesData = JSON.parse(cacheAdminProducts);
    return res.status(200).json({
      success: true,
      categoriesData,
    });
  }
  const products = await Product.find({});
  await redisCache.set("admin-products", JSON.stringify(products));
  return res.status(200).json({
    success: true,
    products,
  });
});
export const getProduct = TryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const cacheProduct = await redisCache.get(`product-${productId}`);
  if (cacheProduct) {
    const productData = JSON.parse(cacheProduct);
    return res.status(200).json({
      success: true,
      productData,
    });
  }
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Invalid Id", 400));
  }
  await redisCache.set(`product-${productId}`, JSON.stringify(product));
  return res.status(200).json({
    success: true,
    product,
  });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Invalid Id", 400));
  }
  if (product.photo) {
    rm(product.photo!, () => {
      console.log("Photo deleted successfully");
    });
  }
  await Product.findByIdAndDelete(productId);
  await deleteCache({ product: true });
  // while deletion also we need to update the redis and clean everything
  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBodyForProduct>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) return next(new ErrorHandler("Please add photo", 400));
    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Deleted Successfully");
      });
    }
    if (!name || !photo || !stock || !category)
      return next(new ErrorHandler("Please fill all the details", 400));
    await Product.create({
      name,
      price,
      stock,
      category,
      photo: photo?.path,
    });

    await deleteCache({ product: true });
    // what this will do is it will clear the cache so now on every get requests it will again reload the cache and put it into the redis
    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);
export const updateProduct = TryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  console.log("photo:", photo);
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Invalid Id", 400));
  }
  if (photo) {
    rm(product.photo!, () => {
      console.log("photo deleted successfully");
    });
    product.photo = photo.path;
  }
  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  await product.save();
  await deleteCache({ product: true });
  // while updation also we need to update the redis and dum everything
  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
});
export const getAllProductsWithFilter = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery: BaseQuery = {};
    if (search)
      baseQuery.name = {
        $regex: search,
        // In MongoDB, you can use regular expressions (regex) for searching by using the $regex operator
        $options: "i",
        // The $options: "i" option is used to make the regex case-insensitive
      };
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };
    if (category) baseQuery.category = category;
    const [products, filteredOnlyProduct] = await Promise.all([
      Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip),
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
