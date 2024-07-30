import express from "express";
import Debug from "debug";
import UserCore from "../core/user.core";
import { validateResult } from "../middleware/validator.mw";
import { body } from "express-validator";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import bcrypt from "bcrypt";
import { generateToken } from "../utils";
import { UserModel } from "../models/user.model";

const debug = Debug("project:user.service");

const login = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isString().exists().withMessage("Invalid password"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserCore.getByEmail(req.body.email);

      if (!user) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "User does not exist",
        });
      }

      // Compare the passwords
      const result = bcrypt.compareSync(req.body.password, user?.password!);
      if (!result) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.BAD_REQUEST,
          error: "Invalid Password! Please input the correct one.",
        });
      }

      const token = await generateToken({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Login successful",
        data: { ...user, token },
      });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

const register = [
  body("email").isEmail().withMessage("Invalid email"),
  body("firstName").isString().withMessage("Invalid first name"),
  body("lastName").isString().withMessage("Invalid last name"),
  body("password").isString().withMessage("Invalid password"),
  body("interest").isString().withMessage("Invalid interest"),
  body("location").isString().withMessage("Invalid location"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const existingUser = await UserCore.getByEmail(req.body.email);

      if (existingUser) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.CONFLICT,
          error: "This email is already taken",
        });
      }

      const user = await UserCore.create({
        email: req.body.email,
        firstName: req.body.firstName,
        interest: req.body.interest,
        lastName: req.body.lastName,
        location: req.body.location,
        password: req.body.password,
        telephone: req.body.telephone,
      });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "User created",
        data: user,
      });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

const resetPassword = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isString().exists().withMessage("Invalid password"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const existingUser = await UserCore.getByEmail(req.body.email);

      if (existingUser) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.CONFLICT,
          error: "This email is already taken",
        });
      }

      if (!existingUser) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: `User with email ${req.body.email} does not exist`,
        });
      }

      //  Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      await UserModel.findOneAndUpdate({ email: req.data.email }, { password: hashedPassword });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Password reset successful",
      });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

export default {
  register,
  login,
  resetPassword,
};
