import mongoose, { Document } from "mongoose";
import { InvalidateCacheType } from "../types/types.js";
import { Product } from "../models/product.js";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "Ecommerce_24",
    })
    .then((c) => console.log(`DB Connected`))
    .catch((e) => console.log(e));
};
export const invalidateCache = async ({
  product,
  order,
  admin,
}: InvalidateCacheType) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "admin-products",
    ];
    const productIds = await Product.find({}).select("_id");
    productIds.forEach((element) => {
      productKeys.push(`product-${element._id}`);
    });
    
  }
};
