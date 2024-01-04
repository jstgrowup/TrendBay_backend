import express from "express";
import { getAllOrders, newOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/new", newOrder);
orderRouter.post("/all", getAllOrders);

export default orderRouter;
