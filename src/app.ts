import express from "express";
import { connectDB } from "./utils/features.js";

import { config } from "dotenv";
import morgan from "morgan";

import cors from "cors";

// Importing Routes
import userRoute from "./routes/user.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

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

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
