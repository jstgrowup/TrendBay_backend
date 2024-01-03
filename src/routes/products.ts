import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import {
  deleteProduct,
  getAllLatestProducts,
  getAllProductsForAdmin,
  getAllUniqueCategories,
  getProduct,
  newProduct,
  updateProduct,
} from "../controllers/product.js";
import { singleUplaod } from "../middlewares/multer.js";
const app = express.Router();

app.post("/new", adminOnly, singleUplaod, newProduct);
// get all latest products in descending order
app.get("/all", getAllLatestProducts);
// get all unique categories
app.get("/categories", getAllUniqueCategories);
// get all products for admin view without and sorting or pagination
app.get("/admin-products", adminOnly, getAllProductsForAdmin);
// for get by id and delete
app
  .route("/:productId")
  .get(getProduct)
  .delete(adminOnly, deleteProduct)
  .put(adminOnly, singleUplaod, updateProduct);

//   search

export default app;
