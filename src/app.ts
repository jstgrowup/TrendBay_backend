import express from "express";
import { connectDB } from "./utils/features.js";

import { config } from "dotenv";
import morgan from "morgan";

import cors from "cors";

import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";

import { errorMiddleware } from "./middlewares/error.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";

connectDB(mongoURI);

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});

// Using Routes
app.use("/api/v1/user", userRoute);
// products router
app.use("/api/v1/product", productRoute);
app.use(errorMiddleware);
// now the uploads folder should be treated as a static folder
app.use("/uploads",express.static("uploads"));

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
