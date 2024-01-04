import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Products",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const OrderItems = mongoose.model("OrderItems", schema);
