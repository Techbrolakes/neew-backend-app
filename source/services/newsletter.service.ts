import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { body } from "express-validator";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { NewletterModel } from "../models/newletter.model";

const debug = Debug("project:newsletter.service");

const subscribe = [
  body("email").isEmail().withMessage("Email must be a valid email"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const email = await NewletterModel.findOne({ email: req.body.email });

      if (email) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.BAD_REQUEST,
          error: "Email already subscribed",
        });
      }

      await NewletterModel.create({
        email: req.body.email,
      });

      ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Subscribed",
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

const unsubscribe = [
  body("email").isEmail().withMessage("Email must be a valid email"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const email = await NewletterModel.findOne({ email: req.body.email });

      if (!email) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.BAD_REQUEST,
          error: "Email not subscribed",
        });
      }

      await NewletterModel.deleteOne({ email: req.body.email });

      ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Unsubscribed",
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

const get = [
  async (req: express.Request, res: express.Response) => {
    try {
      const emails = await NewletterModel.find();

      ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        data: emails,
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
  subscribe,
  get,
  unsubscribe,
};
