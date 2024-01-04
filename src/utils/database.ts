import mongoose, { Document } from "mongoose";
import { InvalidateCacheType } from "../types/types.js";
import { Product } from "../models/product.model.js";
import { redisCache } from "../app.js";

const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "Ecommerce_24",
    })
    .then((c) => console.log(`DB Connected`))
    .catch((e) => console.log(e));
};
export default connectDB;
