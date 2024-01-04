import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { NewOrderRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/product.model.js";
import { rm } from "fs";
import { redisCache } from "../app.js";
import { deleteCache, reduceStock } from "../utils/helpers.js";
import { Order } from "../models/order.model.js";
import { AddressDetails } from "../models/address-details.model.js";
import { OrderItems } from "../models/order-Item.model.js";
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
    if (
      !(
        shippingInfo ||
        user ||
        subtotal ||
        tax ||
        shippingCharges ||
        discount ||
        total ||
        orderItems
      )
    ) {
      return next(new ErrorHandler("Please Provide all the details", 400));
    }
    // for shipping information --------------------------
    if (
      !(
        shippingInfo.address ||
        shippingInfo.city ||
        shippingInfo.country ||
        shippingInfo.pincode ||
        shippingInfo.state
      )
    ) {
      return next(
        new ErrorHandler("Please Provide all the shipping address info", 400)
      );
    }
    const addressDetails = await AddressDetails.create(shippingInfo);
    //   -------------------------------------
    //    for order items ---------------------------
    if (!(orderItems.length > 0)) {
      return next(
        new ErrorHandler(
          "For creating an order you need to have products in you Cart",
          400
        )
      );
    }
    const orderItemsData = await OrderItems.insertMany(orderItems);
    // --------------------------------------------
    await Order.create({
      shippingInfo: addressDetails._id,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
      status,
      orderItems: orderItemsData,
    });
    await reduceStock(orderItems);
    // reduce the stock in the products
    await deleteCache({ product: true, order: true, admin: true });
    // after the stock update we have to update the stock in the cache as well
    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);
