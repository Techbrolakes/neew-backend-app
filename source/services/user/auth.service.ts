import express from "express";
import Debug from "debug";
import UserCore from "../../core/user.core";
import { validateResult } from "../../middleware/validator.mw";
import { body } from "express-validator";
import ResponseHandler from "../../utils/response-handler";
import { HTTP_CODES } from "../../constants/appDefaults.constant";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils";

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
  body("lastName").isString(),
  body("password").isString(),
  body("interest").isString(),
  body("location").isString(),
  body("communityImpact").isString().optional(),
  body("companyName").isString().optional(),
  body("companyLogo").isString().optional(),
  body("ebitda").isString().optional(),
  body("exitFounder").isString().optional(),
  body("exitMethod").isString().optional(),
  body("exitStrategy").isString().optional(),
  body("exitTimeFrame").isString().optional(),
  body("forecastedEbitda").isString().optional(),
  body("founderValuation").isString().optional(),
  body("founderValuationLogic").isString().optional(),
  body("foundingYear").isString().optional(),
  body("growthTrend").isString().optional(),
  body("industry").isString().optional(),
  body("locationOfRegistration").isString().optional(),
  body("networkWants").isString().optional(),
  body("operatingAddress").isString().optional(),
  body("photo").isString().optional(),
  body("revenue").isString().optional(),
  body("sdgImpact").isString().optional(),
  body("traction").isString().optional(),
  body("productMaturity").isString().optional(),
  body("exitFounder").isString().optional(),
  body("exitStrategy").isString().optional(),
  body("exitTimeFrame").isString().optional(),
  body("exitMethod").isString().optional(),
  body("founderValuation").isString().optional(),
  body("founderValuationLogic").isString().optional(),
  body("companyName").isString().optional(),
  body("companyLogo").isString().optional(),
  body("ebitda").isString().optional(),
  body("usp").isString().optional(),
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
        website: req.body.website,
        communityImpact: req.body.communityImpact,
        foundingYear: req.body.foundingYear,
        industry: req.body.industry,
        locationOfRegistration: req.body.locationOfRegistration,
        networkWants: req.body.networkWants,
        operatingAddress: req.body.operatingAddress,
        photo: req.body.photo,
        revenue: req.body.revenue,
        sdgImpact: req.body.sdgImpact,
        traction: req.body.traction,
        productMaturity: req.body.productMaturity,
        growthTrend: req.body.growthTrend,
        exitFounder: req.body.exitFounder,
        exitStrategy: req.body.exitStrategy,
        exitTimeFrame: req.body.exitTimeFrame,
        exitMethod: req.body.exitMethod,
        forecastedEbitda: req.body.forecastedEbitda,
        founderValuation: req.body.founderValuation,
        founderValuationLogic: req.body.founderValuationLogic,
        companyName: req.body.companyName,
        companyLogo: req.body.companyLogo,
        ebitda: req.body.ebitda,
        usp: req.body.usp,
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

export default {
  register,
  login,
};
