import express from "express";
import { connectDB } from "./utils/features";

import { config } from "dotenv";
import userRoute from "routes/user";


// Importing Routes


config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";

connectDB(mongoURI);

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});
app.use("/users/api", userRoute);
app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
