import express from "express";
import Debug from "debug";
import UserCore from "../../core/user.core";
import { validateResult } from "../../middleware/validator.mw";
import { body } from "express-validator";
import ResponseHandler from "../../utils/response-handler";
import { HTTP_CODES } from "../../constants/appDefaults.constant";
import authMw from "../../middleware/auth.mw";
import PostCore from "../../core/post.core";
import { query } from "express-validator";
import { Types } from "mongoose";
import { throwIfUndefined } from "../../utils";

const debug = Debug("project:post.service");

const create = [
  authMw,
  body("content").isString().withMessage("Content must be a string"),
  body("image").isString().withMessage("Image must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");
      const newPost = await PostCore.create({
        content: req.body.content,
        creator: new Types.ObjectId(user.id),
        image: req.body.image,
      });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "Post created",
        data: newPost,
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

const list = [
  authMw,
  query("perpage").isNumeric().withMessage("Perpage must be a number").optional(),
  query("page").isNumeric().withMessage("Page must be a number").optional(),
  query("dateFrom").isString().withMessage("DateFrom must be a string").optional(),
  query("dateTo").isString().withMessage("DateTo must be a string").optional(),
  query("period").isString().withMessage("Period must be a string").optional(),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");
      const posts = await PostCore.find(req, new Types.ObjectId(user.id));

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Users fetched successfully",
        ...posts,
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

const getAll = [
  authMw,
  query("perpage").isNumeric().withMessage("Perpage must be a number").optional(),
  query("page").isNumeric().withMessage("Page must be a number").optional(),
  query("dateFrom").isString().withMessage("DateFrom must be a string").optional(),
  query("dateTo").isString().withMessage("DateTo must be a string").optional(),
  query("period").isString().withMessage("Period must be a string").optional(),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const posts = await PostCore.getAll(req);

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Users fetched successfully",
        ...posts,
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
  list,
  create,
  getAll,
};
