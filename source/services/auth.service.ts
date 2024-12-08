import express from "express";
import Debug from "debug";
import UserCore from "../core/user.core";
import { validateResult } from "../middleware/validator.mw";
import { body } from "express-validator";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import bcrypt from "bcrypt";
import { generateToken } from "../utils";
import { AuthProvider, UserModel } from "../models/user.model";
import { OAuth2Client } from "google-auth-library";

const debug = Debug("project:user.service");

const secretKey = "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";
const clientId = "617862799460-erkfh2qvd432t4j1p0uqifpgc3pbmpe1.apps.googleusercontent.com";
const oauth2Client = new OAuth2Client(clientId, secretKey, "http://localhost:9001/api/auth/google/callback");

const generateGoogleAuthUrl = [
  async (req: express.Request, res: express.Response) => {
    try {
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
        prompt: "select_account",
      });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Success",
        data: { authorizationUrl: url },
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

const googleCallback = [
  async (req: express.Request, res: express.Response) => {
    try {
      const code = req.query.code as string;

      // Exchange the authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      const accessToken = tokens.access_token;

      // Fetch user details from Google’s user info endpoint
      // Fetch user details from Google’s user info endpoint using Fetch API
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoResponse.statusText}`);
      }

      const user = await userInfoResponse.json();

      console.log("user", user);
      console.log("tokens", tokens);

      console.log("tokens", tokens);

      res.redirect(`http://localhost:3000?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`);

      res.json({ message: "Google callback", tokens });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

const login = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isString().exists().withMessage("Invalid password"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserCore.getByEmail(req.body.email);

      if (!user?.password) {
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

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "User created",
        data: { user, token },
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

export default {
  register,
  login,
  resetPassword,
  checkEmail,
  generateGoogleAuthUrl,
  googleCallback,
};
