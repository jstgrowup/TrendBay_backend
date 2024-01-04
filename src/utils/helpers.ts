import { InvalidateCacheType, OrderItemsType } from "../types/types.js";
import { Product } from "../models/product.model.js";
import { redisCache } from "../app.js";
import { faker } from "@faker-js/faker";
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
export const createRandomData = async (count: number = 10) => {
  const products = [];

  for (let i = 0; i < count; i++) {
    const product = {
      name: faker.commerce.productName(),
      photo: "uploadsdec34618-5702-4cbe-9a63-99dbf23d8ded.jpg",
      price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
      stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
      category: faker.commerce.department(),
      createdAt: new Date(faker.date.past()),
      updatedAt: new Date(faker.date.recent()),
      __v: 0,
    };

    products.push(product);
  }
  await Product.create(products);
  console.log({ succecss: true });
};
