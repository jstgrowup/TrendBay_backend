import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { NewUserRequestBody } from "../types/types";

export const newUser = async (
  req: Request<{}, {}, NewUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { name, email, photo, gender, _id, dob } = req.body;

  let user = await User.findById(_id);

  if (user)
    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });

  user = await User.create({
    name,
    email,
    photo,
    gender,
    _id,
    dob: new Date(dob),
  });

  return res.status(201).json({
    success: true,
    message: `Welcome, ${user.name}`,
  });
};
