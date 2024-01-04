import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { NewOrderRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.model.js";
import { rm } from "fs";
import { redisCache } from "../app.js";
import { deleteCache } from "../utils/features.js";
export const newOrder = TryCatch(
  async (
    req: Request<{}, {}, NewOrderRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingInfo,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
      status,
      orderItems,
    } = req.body;
     const 
    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);
