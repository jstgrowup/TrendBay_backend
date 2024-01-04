import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Products",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    photo: {
      type: Number,
      required: [true, "Photo is required"],
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
