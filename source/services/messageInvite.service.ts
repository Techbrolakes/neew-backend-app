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
import { UserModel } from "../models/user.model";

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
      })
        .populate("receiver", "firstName lastName email")
        .populate("sender", "firstName lastName email");

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

      const currentUser = await UserModel.findById(user.id);

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
            receiver: messageInvite.receiver,
            sender: messageInvite.sender,
          }),

          NotificationModel.create({
            message: `${currentUser.firstName} ${currentUser.lastName} accepted your connect request`,
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
            message: `${currentUser.firstName} ${currentUser.lastName} rejected your connect request`,
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

      const receiverDetails = await UserModel.findById(req.body.receiver);

      if (!receiverDetails) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Receiver not found",
        });
      }

      debug("receiverDetails", receiverDetails);

      const existingMessageInvite = await MessageInviteModel.findOne({
        receiver: req.body.receiver,
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
        receiver: req.body.receiver,
        sender: new Types.ObjectId(user.id),
      });

      await NotificationModel.create({
        message: `You sent a connect request to ${receiverDetails.firstName} ${receiverDetails.lastName} once they accept you can start chatting`,
        notificationType: "sent-invite",
        userId: user.id,
      });

      await NotificationModel.create({
        message: "You have a new connect request",
        notificationType: "message-invite",
        userId: req.body.receiver,
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
