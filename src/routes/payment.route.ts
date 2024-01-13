import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  newCoupon,
  applyDiscount,
  allCoupons,
  deleteCoupon,
  createPayment,
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();
paymentRouter.post("/create", createPayment);

paymentRouter.get("/discount", applyDiscount);
paymentRouter.post("/coupon/new", adminOnly, newCoupon);
paymentRouter.get("/allCoupons", adminOnly, allCoupons);
paymentRouter.delete("/coupon/:id", adminOnly, deleteCoupon);

export default paymentRouter;
