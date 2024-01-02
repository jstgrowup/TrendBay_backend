import express from "express";
import { newUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// route - /api/v1/user/new
app.post("/new", newUser);

export default app;
