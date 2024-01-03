import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import {
  NewUserRequestBodyForProduct,
  SearchRequestQuery,
} from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.js";
import { rm } from "fs";

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
    await Product.create({
      name,
      price,
      stock,
      category,
      photo: photo?.path,
    });

    // if (!_id || !name || !email || !photo || !gender || !dob)
    //   return next(new ErrorHandler("Please fill all the details", 400));

    // console.log("user:", user);
    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);
export const getAllLatestProducts = TryCatch(async (req, res, next) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
  return res.status(200).json({
    success: true,
    products,
  });
});
export const getAllUniqueCategories = TryCatch(async (req, res, next) => {
  const products = await Product.distinct("category");
  return res.status(200).json({
    success: true,
    products,
  });
});
export const getAllProductsForAdmin = TryCatch(async (req, res, next) => {
  const products = await Product.find({});
  return res.status(200).json({
    success: true,
    products,
  });
});
export const getProduct = TryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Invalid Id", 400));
  }
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
      console.log("photo deleted successfully");
    });
  }
  await Product.findByIdAndDelete(productId);
  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
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
    const products = await Product.find({
      name: {
        $regex: search,
        $options: "i",
      },
      price: {
        $lte: Number(price),
      },
      category,
    });
    return res.status(200).json({
      success: true,
      products,
    });
  }
);
