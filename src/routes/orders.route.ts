import express from "express";
import {
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  newOrder,
  updateOrder,
} from "../controllers/order.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const orderRouter = express.Router();

orderRouter.post("/new", newOrder);
orderRouter.get("/my", getMyOrders);
orderRouter.get("/all", adminOnly, getAllOrders);
orderRouter
  .route("/:orderId")
  .get(getSingleOrder)
  .put(adminOnly, updateOrder)
  .delete(adminOnly, deleteOrder);

export default orderRouter;
