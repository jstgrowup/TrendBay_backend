import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },
    photo: {
      type: String,
      required: [true, "Photo is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
    },
    category: {
      type: String,
      required: [true, "Product Category is required"],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Products", schema);
