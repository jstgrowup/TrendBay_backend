import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/user.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const userRouter = express.Router();

// route - /api/v1/user/new
userRouter.post("/new", newUser);

// route - /api/v1/user/all
userRouter.get("/all", adminOnly, getAllUsers);

// route - /api/v1/user/:id
userRouter.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default userRouter;
