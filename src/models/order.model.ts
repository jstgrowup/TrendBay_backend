import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    shippingInfo: {
      type: mongoose.Types.ObjectId,
      ref: "addressdetails",
    },
    user: {
      type: String,
      ref: "users",
      required: [true, "User is required"],
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
    },
    tax: {
      type: Number,
      required: [true, "Tax is required"],
    },
    shippingCharges: {
      type: Number,
      required: [true, "Shipping charges is required"],
    },
    discount: {
      type: Number,
      required: [true, "discount is required"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems: [
      {
        type: mongoose.Types.ObjectId,
        ref: "orderitems",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("orders", schema);
