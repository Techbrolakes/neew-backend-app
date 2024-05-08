import express from "express";
import Debug from "debug";
import UserCore from "../../core/user.core";
import { validateResult } from "../../middleware/validator.mw";
import { body } from "express-validator";
import ResponseHandler from "../../utils/response-handler";
import { HTTP_CODES } from "../../constants/appDefaults.constant";
import authMw from "../../middleware/auth.mw";
import PostCore from "../../core/post.core";

const debug = Debug("project:post.service");

const create = [
  authMw,
  body("content").isString().withMessage("Content must be a string"),
  body("image").isString().withMessage("Image must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const newPost = await PostCore.create({
        content: req.body.content,
        creator: req.user._id,
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
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await UserCore.getByEmail(req.user.email);

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Users fetched successfully",
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
  list,
  create,
};
