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
import mongoose from "mongoose";
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
export const getMyOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    const cachedOrders = await redisCache.get(`my-orders-${id}`);
    if (cachedOrders) {
      const cachedOrdersData = JSON.parse(cachedOrders);
      return res.status(200).json({
        success: true,
        cachedOrdersData,
      });
    }
    const ordersDataFromDb = await Order.aggregate([
      {
        $match: {
          user: id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderItems",
          foreignField: "_id",
          as: "orderItems",
        },
      },
    ]);
    await redisCache.set(`my-orders-${id}`, JSON.stringify(ordersDataFromDb));
    return res.status(201).json({
      success: true,
      ordersDataFromDb,
    });
  }
);
export const getAllOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const cachedOrders = await redisCache.get("orders");
    if (cachedOrders) {
      const ordersData = JSON.parse(cachedOrders);
      return res.status(200).json({
        success: true,
        ordersData,
      });
    }
    const ordersData = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderItems",
          foreignField: "_id",
          as: "orderItems",
        },
      },
    ]);
    await redisCache.set("orders", JSON.stringify(ordersData));
    return res.status(201).json({
      success: true,
      ordersData,
    });
  }
);
export const getSingleOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const cachedOrder = await redisCache.get(`order-${orderId}`);
    if (cachedOrder) {
      const orderData = JSON.parse(cachedOrder);
      return res.status(200).json({
        success: true,
        orderData,
      });
    }
    const ordersIndividualData = await Order.findById(orderId);
    if (!ordersIndividualData) {
      return next(new ErrorHandler("Invalid Id", 400));
    }
    const orderData = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(orderId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderItems",
          foreignField: "_id",
          as: "orderItems",
        },
      },
    ]);

    await redisCache.set(`order-${orderId}`, JSON.stringify(orderData));
    return res.status(201).json({
      success: true,
      orderData,
    });
  }
);
