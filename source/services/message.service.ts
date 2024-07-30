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

const debug = Debug("project:message.service");

const seen = [
  authMw,
  body("conversationId").isString().withMessage("ConversationId must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const conversation = await ConversationModel.findById(req.data.conversationId);

      if (!conversation) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "conversation not found",
        });
      }

      await MessageModel.updateMany(
        { conversationId: req.data.conversationId, senderId: { $ne: user.id } },
        { $set: { status: "seen" } },
      );

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "updated",
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

const post = [
  authMw,
  body("conversationId").isString().withMessage("ConversationId must be a string"),
  body("text").isString().withMessage("Text must be a string"),
  body("image").isString().withMessage("Image must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const newMessage = await MessageModel.create({
        conversationId: req.data.conversationId,
        image: req.data.image,
        senderId: user.id,
        text: req.data.text,
      });

      await ConversationModel.findByIdAndUpdate(
        req.data.conversationId,
        {
          $push: { messages: newMessage._id },
          lastMessageAt: new Date(),
        },
        { new: true },
      )
        .populate("users")
        .populate({
          path: "messages",
          populate: { path: "seen" },
        });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Success",
        data: newMessage,
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
  post,
  seen,
};
