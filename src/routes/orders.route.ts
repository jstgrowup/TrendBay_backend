import express from "express";
import {
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  newOrder,
} from "../controllers/order.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const orderRouter = express.Router();

orderRouter.post("/new", newOrder);
orderRouter.get("/my", getMyOrders);
orderRouter.get("/all", adminOnly, getAllOrders);
orderRouter.route("/:orderId").get(getSingleOrder)


export default orderRouter;
