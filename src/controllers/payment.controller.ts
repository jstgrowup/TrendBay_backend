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
import { redisCache, stripe } from "../app.js";
import { deleteCache } from "../utils/helpers.js";
import { Coupon } from "../models/coupon.model.js";
export const createPayment = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
    });

    if (!amount) {
      return next(new ErrorHandler("Please provide amount", 400));
    }

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  }
);
export const newCoupon = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { couponCode, amount } = req.body;
    const foundCoupon = await Coupon.findOne({ couponCode: couponCode });
    console.log("foundCoupon:", foundCoupon);
    if (foundCoupon) {
      return next(new ErrorHandler("Coupon code already exists", 400));
    }
    if (!(couponCode || amount)) {
      return next(
        new ErrorHandler("Please provide couponcode and amount", 400)
      );
    }
    await Coupon.create({ couponCode, amount });
    return res.status(200).json({
      success: true,
      message: `Coupon ${couponCode} created successfully`,
    });
  }
);
export const applyDiscount = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { coupon } = req.query;
    const foundCoupon = await Coupon.findOne({ couponCode: coupon });

    if (!foundCoupon) {
      return next(new ErrorHandler("Invalid coupon", 400));
    }

    return res.status(200).json({
      success: true,
      discount: foundCoupon.amount,
    });
  }
);
export const allCoupons = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const foundCoupons = await Coupon.find({});

    return res.status(200).json({
      success: true,
      data: foundCoupons,
    });
  }
);
export const deleteCoupon = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const foundCoupon = await Coupon.findById(id);
    if (!foundCoupon) {
      return next(new ErrorHandler("Invalid coupon", 400));
    }
    await Coupon.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "COupon delelted successfully",
    });
  }
);
