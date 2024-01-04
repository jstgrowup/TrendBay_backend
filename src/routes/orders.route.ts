import express from "express";
import { newOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/new", newOrder);

export default orderRouter;
