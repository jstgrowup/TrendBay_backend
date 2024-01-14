import { NextFunction, Request, Response } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
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
    const newOrder = await Order.create({
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
    await deleteCache({
      product: true,
      order: true,
      admin: true,
      userId: newOrder.user,
    });
    // after the stock update we have to update the stock in the cache as well
    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);
export const getMyOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.query;
    let data;
    const cachedOrders = await redisCache.get(`my-orders-${userId}`);

    if (cachedOrders) {
      data = JSON.parse(cachedOrders);
      return res.status(200).json({
        success: true,
        data,
      });
    }
    const ordersDataFromDb = await Order.aggregate([
      {
        $match: {
          user: userId,
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
    await redisCache.set(
      `my-orders-${userId}`,
      JSON.stringify(ordersDataFromDb)
    );
    return res.status(201).json({
      success: true,
      data: ordersDataFromDb,
    });
  }
);
export const getAllOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("hello")
      const cachedOrders = await redisCache.get("orders");

      if (cachedOrders) {
        const ordersData = JSON.parse(cachedOrders);
        return res.status(200).json({
          success: true,
          data: ordersData,
        });
      }
      console.log("coming here");

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
        data: ordersData,
      });
    } catch (error) {
      console.log("error:", error);
    }
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
        data: orderData,
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
      data: orderData,
    });
  }
);
export const updateOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const orderDetails = await Order.findById(orderId);
    if (!orderDetails) return next(new ErrorHandler("Invalid Id", 400));
    await Order.updateOne({ _id: orderId }, [
      {
        $set: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "Processing"] }, then: "Shipped" },
                { case: { $eq: ["$status", "Shipped"] }, then: "Delivered" },
              ],
              default: "Delivered",
            },
          },
        },
      },
    ]);
    // await Order.updateOne(
    // This part of the query specifies that we are performing an update operation on the Order collection. It updates a single document based on the specified filter.
    // { _id: orderId },
    // The filter specifies which document to update. In this case, it's selecting the document with the specified _id (orderId).
    // [ { $set: { status: { $switch: { branches: [ ... ], default: "Delivered", }, }, }, }, ]
    // This is the update part of the query. It uses the $set operator to set the value of the status field based on the result of a $switch statement.
    // $set Operator:
    // The $set operator updates the value of the specified field (status in this case) in the document.
    // status: { $switch: { branches: [ ... ], default: "Delivered", }, },
    // This part of the query sets the value of the status field using the $switch operator, which allows for conditional branching.
    // `$switch Operator:
    // The $switch operator provides a way to perform conditional logic. It has branches, each specifying a condition and a value to return if the condition is true.
    // branches: [ { case: { $eq: ["$status", "Processing"] }, then: "Shipped" }, { case: { $eq: ["$status", "Shipped"] }, then: "Delivered" }, ],
    // The branches array contains individual conditions and their corresponding values. In this example, there are two branches:
    // If the status is equal to "Processing", set it to "Shipped".
    // If the status is equal to "Shipped", set it to "Delivered".
    // default: "Delivered",
    // The default specifies the value to use if none of the conditions in the branches array is true. In this case, if the current status doesn't match any of the specified conditions, it defaults to "Delivered".
    await deleteCache({
      product: false,
      order: true,
      admin: true,
      userId: orderDetails.user,
      orderId: String(orderDetails._id),
    });
    return res.status(201).json({
      success: true,
      message: "Order Updated Successfully",
    });
  }
);
export const deleteOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const orderDetails = await Order.findById(orderId);
    if (!orderDetails) return next(new ErrorHandler("Invalid Id", 400));
    const shippingDetails = await AddressDetails.findById(
      orderDetails?.shippingInfo
    );
    if (!shippingDetails)
      return next(new ErrorHandler("No Shipping details Found", 400));
    await AddressDetails.findByIdAndDelete(orderDetails.shippingInfo);
    if (!orderDetails.orderItems || orderDetails.orderItems.length === 0) {
      return next(new ErrorHandler("No Order Items Found", 400));
    }
    await OrderItems.deleteMany({
      _id: {
        $in: orderDetails?.orderItems,
      },
    });
    await Order.findByIdAndDelete(orderId);
    await deleteCache({
      product: false,
      order: true,
      admin: true,
      userId: orderDetails.user,
      orderId: String(orderDetails._id),
    });
    return res.status(201).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  }
);
