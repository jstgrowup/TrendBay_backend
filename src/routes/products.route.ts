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
} from "../controllers/product.controller.js";
import { singleUplaod } from "../middlewares/multer.js";
const productRouter = express.Router();

productRouter.post("/new", adminOnly, singleUplaod, newProduct);
// get all latest products in descending order
productRouter.get("/all", getAllLatestProducts);
// get all unique categories
productRouter.get("/categories", getAllUniqueCategories);
// get all products for admin view without and sorting or pagination
productRouter.get("/admin-products", adminOnly, getAllProductsForAdmin);
// for get by id and delete
productRouter
  .route("/:productId")
  .get(getProduct)
  .delete(adminOnly, deleteProduct)
  .put(adminOnly, singleUplaod, updateProduct);

//  search

export default productRouter;
