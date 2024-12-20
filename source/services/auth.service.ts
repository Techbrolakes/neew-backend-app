import express from "express";
import Debug from "debug";
import UserCore from "../core/user.core";
import { validateResult } from "../middleware/validator.mw";
import { body } from "express-validator";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import bcrypt from "bcrypt";
import { generateRefreshToken, generateToken } from "../utils";
import { AuthProvider, UserModel } from "../models/user.model";
import frontUserUtil from "../utils/frontUser.utils";

const debug = Debug("project:user.service");

const login = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isString().exists().withMessage("Invalid password"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserCore.getByEmail(req.body.email);

      if (!user?.password && user?.provider === AuthProvider.google) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "User registered with Google. Please login with Google",
        });
      }

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

      const refreshToken = await generateRefreshToken({
        id: user._id,
        email: user.email,
      });

      await UserModel.findOneAndUpdate({ email: req.body.email }, { $set: { refreshToken } }, { new: true });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Login successful",
        data: { ...user, token, refreshToken },
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
  body("interest").isArray().withMessage("Invalid interest"),
  body("location").isString().withMessage("Invalid location"),
  body("industry").isArray().withMessage("Invalid industry"),
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
        industry: req.body.industry,
        lastName: req.body.lastName,
        location: req.body.location,
        password: req.body.password,
        telephone: req.body.telephone,
        provider: AuthProvider.local,
        provider_id: req.body.email,
      });

      const token = await generateToken({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user._id,
      });

      const refreshToken = await generateRefreshToken({
        id: user._id,
        email: user.email,
      });

      await UserModel.findOneAndUpdate({ email: req.body.email }, { $set: { refreshToken } }, { new: true });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "User created",
        data: { user, token, refreshToken },
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

const checkEmail = [
  body("email").isEmail().withMessage("Invalid email"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserCore.getByEmail(req.body.email);

      if (user) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.CONFLICT,
          error: "This email is already taken",
        });
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "Success",
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

const refreshToken = [
  body("refreshToken").isString().withMessage("Refresh token is required"),
  body("accessToken").isString().withMessage("Access token is required"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const { refreshToken, accessToken } = req.body;

      // Decode the refresh token
      const decodedRefreshToken = await frontUserUtil.decodeRefreshToken(refreshToken);

      // Find user by ID
      const user = await UserModel.findById(decodedRefreshToken.id);
      if (!user) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.UNAUTHORIZED,
          error: "Invalid refresh token",
        });
      }

      // Check if refresh tokens match
      if (user.refreshToken !== refreshToken) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.UNAUTHORIZED,
          error: "Invalid refresh token",
        });
      }

      // Decode the access token
      const decodedAccessToken: any = await frontUserUtil.decodeAccessToken(accessToken);

      let newAccessToken = accessToken;

      // Check if access token has expired
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decodedAccessToken.exp < currentTime) {
        // Generate a new access token if expired
        newAccessToken = await generateToken({
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      }

      // Optionally rotate refresh token
      const newRefreshToken = await generateRefreshToken({ id: user._id, email: user.email });
      user.refreshToken = newRefreshToken; // rotate the token
      await user.save();

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Token refreshed",
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.UNAUTHORIZED,
        error: "Invalid or expired refresh token",
      });
    }
  },
];

export default {
  register,
  login,
  resetPassword,
  checkEmail,
  refreshToken,
};
