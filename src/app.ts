import express from "express";
import connectDB from "./utils/database.js";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/products.route.js";
import orderRouter from "./routes/orders.route.js";
import { errorMiddleware } from "./middlewares/error.js";
import Redis from "ioredis";
export const redisCache = new Redis.default();

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";

connectDB(mongoURI);

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
// for this type of information GET /api/v1/product/65958b5aea905a84bd2032be 200 9.948 ms - 282
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});

// Using Routes
app.use("/api/v1/user", userRoute);
// products router
app.use("/api/v1/product", productRoute);
// order route
app.use("/api/v1/order", orderRouter);
app.use(errorMiddleware);
// now the uploads folder should be treated as a static folder
app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
