import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { body } from "express-validator";
import authMw from "../middleware/auth.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { NotificationModel } from "../models/notification.model";
import { MessageInviteModel } from "../models/message-invites.model";
import { throwIfUndefined } from "../utils";
import { Types } from "mongoose";
import { ConversationModel } from "../models/conversation.model";

const debug = Debug("project:messageInvite.service");

const senderlist = [
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const messageInvites = await MessageInviteModel.find({
        inviteStatus: "pending",
        sender: new Types.ObjectId(user.id),
      }).populate("receiver", "firstName lastName email");

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Message Invites fetched",
        data: messageInvites,
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
      const user = throwIfUndefined(req.user, "req.user");

      const messageInvites = await MessageInviteModel.find({
        inviteStatus: "pending",
        receiver: new Types.ObjectId(user.id),
      }).populate("sender", "firstName lastName email");

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Message Invites fetched",
        data: messageInvites,
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

const put = [
  authMw,
  body("inviteId").isString().withMessage("Invite Id must be a string"),
  body("inviteStatus").isString().withMessage("Invite Status must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const messageInvite = await MessageInviteModel.findById(req.data.inviteId);

      if (!messageInvite) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Message invite not found",
        });
      }

      if (req.data.inviteStatus === "accepted") {
        await Promise.all([
          MessageInviteModel.findOneAndUpdate({ _id: req.data.inviteId }, { inviteStatus: "accepted" }),

          ConversationModel.create({
            users: [messageInvite.sender, messageInvite.receiver],
          }),

          NotificationModel.create({
            message: "Your message invite has been accepted",
            notificationType: "message-invite",
            userId: messageInvite.sender,
          }),
        ]);

        return ResponseHandler.sendSuccessResponse({
          res,
          code: HTTP_CODES.OK,
          message: "Message Invite Accepted",
        });
      }

      if (req.data.inviteStatus === "rejected") {
        await Promise.all([
          MessageInviteModel.findOneAndUpdate({ _id: req.data.inviteId }, { inviteStatus: "rejected" }),

          NotificationModel.create({
            message: "Your message invite has been rejected",
            notificationType: "message-invite",
            userId: messageInvite.sender,
          }),
        ]);

        return ResponseHandler.sendSuccessResponse({
          res,
          code: HTTP_CODES.OK,
          message: "Message Invite Rejected",
        });
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        data: messageInvite,
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

const create = [
  authMw,
  body("receiver").isString().withMessage("Receiver must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const existingMessageInvite = await MessageInviteModel.findOne({
        receiver: req.data.receiver,
        sender: new Types.ObjectId(user.id),
      });

      if (existingMessageInvite) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.BAD_REQUEST,
          error: "Message request already sent to user",
        });
      }

      const newMessageInvite = await MessageInviteModel.create({
        receiver: req.data.receiver,
        sender: new Types.ObjectId(user.id),
      });

      await NotificationModel.create({
        message: "You have a new message invite",
        notificationType: "message-invite",
        userId: req.data.receiver,
      });

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "Message invite sent",
        data: newMessageInvite,
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
  create,
  list,
  put,
  senderlist,
};
