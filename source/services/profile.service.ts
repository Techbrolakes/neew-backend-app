import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { body } from "express-validator";
import authMw from "../middleware/auth.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { throwIfUndefined } from "../utils";
import { MessageModel } from "../models/message.model";
import { ConversationModel } from "../models/conversation.model";
import { UserModel } from "../models/user.model";

const debug = Debug("project:profile.service");

const update = [
  authMw,
  body("email").isEmail().optional().withMessage("Invalid email"),
  body("firstName").isString().optional().withMessage("Invalid first name"),
  body("lastName").isString().optional(),
  body("interest").isString().optional(),
  body("location").isString().optional(),
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
      const user = throwIfUndefined(req.user, "req.user");

      const updatedUser = await UserModel.findByIdAndUpdate(user.id, req.body, { new: true });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "User updated",
        data: updatedUser,
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

const me = [
  authMw,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      console.log('user', user)

      const currentUser = await UserModel.findById(user.id).select("-password").lean(true);

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "User fetched successfully",
        data: currentUser,
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
  me,
  update,
};
