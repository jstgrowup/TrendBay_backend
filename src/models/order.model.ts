import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    shippingInfo: {
      type: mongoose.Types.ObjectId,
      ref: "AddressDetails",
    },
    user: {
      type: String,
      ref: "Users",
      required: [true, "User is required"],
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
    },
    tax: {
      type: Number,
      required: [true, "Subtotal is required"],
    },
    shippingCharges: {
      type: Number,
      required: [true, "Subtotal is required"],
    },
    discount: {
      type: Number,
      required: [true, "Subtotal is required"],
    },
    total: {
      type: Number,
      required: [true, "Stock is required"],
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems: [
      {
        type: mongoose.Types.ObjectId,
        ref: "OrderItems",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Orders", schema);
