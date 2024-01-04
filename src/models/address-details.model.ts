import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    pincode: {
      type: Number,
      required: [true, "Pincode is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const AddressDetails = mongoose.model("AddressDetails", schema);
