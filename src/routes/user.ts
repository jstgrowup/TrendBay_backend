import { newUser } from "controllers/user";
import express from "express";

const userRoute = express.Router();
userRoute.post("/new", newUser);
export default userRoute;
