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
import { calculatePercentage, deleteCache } from "../utils/helpers.js";
import moment from "moment";
import { Order } from "../models/order.model.js";

export const getDashboardStats = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminStats = await redisCache.get("admin-stats");
    if (adminStats) {
      const adminData = JSON.parse(adminStats);
      return res.status(200).json({
        success: true,
        adminData,
      });
    }

    const today = moment();

    const thisMonth = {
      start: moment().startOf("month"),
      end: today,
    };

    const lastMonth = {
      start: moment().subtract(1, "months").startOf("month"),
      end: moment().subtract(1, "months").endOf("month"),
    };

    const lastSixMonths = today.clone().subtract(6, "months");

    const promiseForthisMonthProducts = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const promiseForlastMonthProducts = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const promiseForthisMonthUsers = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const promiseForlastMonthUsers = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const promiseForthisMonthOrders = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const promiseForlastMonthOrders = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const promiseForLastSixMoonthsOrders = Order.find({
      createdAt: {
        $gte: lastSixMonths,
        $lte: today,
      },
    });

    const [
      thisMonthProducts,
      lastMonthProducts,
      thisMonthUsers,
      lastMonthUsers,
      thisMonthOrders,
      lastMonthOrders,
      productsCount,
      usersCount,
      allOrdersAmount,
      lastSixMonthsOrders,
      categories,
      femalePopulation,
    ] = await Promise.all([
      promiseForthisMonthProducts,
      promiseForlastMonthProducts,
      promiseForthisMonthUsers,
      promiseForlastMonthUsers,
      promiseForthisMonthOrders,
      promiseForlastMonthOrders,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      promiseForLastSixMoonthsOrders,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
    ]);

    const userPercentage = calculatePercentage(
      thisMonthUsers.length,
      lastMonthUsers.length
    );
    const productPercentage = calculatePercentage(
      thisMonthProducts.length,
      lastMonthProducts.length
    );
    const orderPercentage = calculatePercentage(
      thisMonthOrders.length,
      lastMonthOrders.length
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const revenue = allOrdersAmount.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);
    const bargraphOrders = new Array(6).fill(0);
    const bargraphOrdersForRevenue = new Array(6).fill(0);

    lastSixMonthsOrders.forEach((order) => {
      const monthDiffrence = new Date().getMonth() - order.createdAt.getMonth();
      if (monthDiffrence < 6) {
        bargraphOrders[6 - monthDiffrence - 1] += 1;
        bargraphOrdersForRevenue[6 - monthDiffrence - 1] += order.total;
      }
    });

    const categoriesCountPromise = categories.map((category) => {
      return Product.countDocuments({ category });
    });
    const categoryCount = await Promise.all(categoriesCountPromise);
    const categoryCountWithCategoryName: any = [];
    categories.forEach((item, i) => {
      categoryCountWithCategoryName.push({
        [item]: Math.round((categoryCount[i] / productsCount) * 100),
      });
    });
    const dashboard = {
      thisMonthRevenue,
      userPercentage,
      productPercentage,
      orderPercentage,
      categoryCount: categoryCountWithCategoryName,
      revenue,
      users: usersCount,
      userRatio: {
        femalePopulation,
        malePopulation: usersCount - femalePopulation,
      },
      products: productsCount,
      orders: allOrdersAmount.length,
      chart: {
        bargraphOrders,
        bargraphOrdersForRevenue,
      },
    };
    await redisCache.set("admin-stats", JSON.stringify(dashboard));
    res.status(200).json({
      success: true,
      dashboard,
    });
  }
);
export const getPieCharts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const pieChartStats = await redisCache.get("admin-pie-chart");
    if (pieChartStats) {
      const piechartData = JSON.parse(pieChartStats);
      return res.status(200).json({
        success: true,
        piechartData,
      });
    }

    
  }
);
export const getBarCharts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const getLineCharts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {}
);
