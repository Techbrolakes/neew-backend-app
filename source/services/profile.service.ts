import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import authMw from "../middleware/auth.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { throwIfUndefined } from "../utils";
import { UserModel } from "../models/user.model";
import { NewsletterModel } from "../models/newsletter.model";

const debug = Debug("project:profile.service");

const update = [
  authMw,
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

      const currentUser = await UserModel.findById(user.id).select("-password").lean(true);

      const doesExitInNewsletter = await NewsletterModel.findOne({ email: currentUser.email });

      const response = {
        ...currentUser,
        isSubscribed: !!doesExitInNewsletter,
      };

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "User fetched successfully",
        data: response,
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
