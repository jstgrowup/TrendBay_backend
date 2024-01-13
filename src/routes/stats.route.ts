import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import { getDashboardStats } from "../controllers/stats.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", getDashboardStats);

export default dashboardRouter;
