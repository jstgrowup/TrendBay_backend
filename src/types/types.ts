import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}
export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;
export interface NewUserRequestBodyForProduct {
  name: string;
  photo: string;
  price: number;
  stock: number;
  category: string;
}
export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};
export interface BaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string;
}
export type InvalidateCacheType = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
};
export type AddressDetailsType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
};
export type OrderItemsType = {
  productId: mongoose.Types.ObjectId;
  quantity: number;
};
export interface NewOrderRequestBody {
  shippingInfo: AddressDetailsType;
  user: mongoose.Types.ObjectId;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: string;
  orderItems: OrderItemsType[];
}
