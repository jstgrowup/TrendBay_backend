import { InvalidateCacheType, OrderItemsType } from "../types/types.js";
import { Product } from "../models/product.model.js";
import { redisCache } from "../app.js";

export const deleteCache = async ({
  product,
  order,
  admin,
}: InvalidateCacheType) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "admin-products",
    ];
    const productIds = await Product.find({}).select("_id");
    productIds.forEach((element) => {
      productKeys.push(`product-${element._id}`);
    });

    redisCache.del(`${productKeys.join(" ")}`);
  }
  if (order) {
  }
  if (admin) {
  }
};
export const reduceStock = async (orderItems: OrderItemsType[]) => {
  for (const { productId, quantity } of orderItems) {
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true }
    );
  }
};
