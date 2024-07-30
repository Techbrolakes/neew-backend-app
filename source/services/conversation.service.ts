import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import authMw from "../middleware/auth.mw";
import { throwIfUndefined } from "../utils";
import { ConversationModel } from "../models/conversation.model";
import { Types } from "mongoose";
import { MessageModel } from "../models/message.model";
import conversationCore from "../core/conversation.core";

const debug = Debug("project:conversation.service");

const list = [
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");
      const userId = user.id;

      const conversations = await ConversationModel.find({
        users: { $in: [user.id] },
      })
        .populate("users", "firstName lastName email photo")
        .sort({ updatedAt: -1 });

        
      if (!conversations.length) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "No conversations found",
        });
      }

      // Fetch the last message for each conversation
      const conversationIds = conversations.map((conversation: any) => conversation._id);
      const messages = await MessageModel.aggregate([
        { $match: { conversationId: { $in: conversationIds } } },
        // { $sort: { createdAt: -1 } }, // Sort messages by creation date in descending order
        {
          $group: {
            _id: "$conversationId",
            lastMessage: { $first: "$$ROOT" }, // Get the first document in each group, which is the latest message
          },
        },
      ]);

      // Loop through the conversations array to update unread counts and flags
      for (const conversation of conversations) {
        await conversationCore.updateUnreadCountAndFlag(conversation._id.toString(), userId);
      }

      // Create a map of conversationId to last message
      const lastMessagesMap = messages.reduce((acc: any, message: any) => {
        acc[message._id.toString()] = message.lastMessage;
        return acc;
      }, {});

      // Combine conversations with their respective last messages
      const filteredConversations = conversations.map((conversation: any) => {
        const otherUser = conversation.users.filter((user: any) => user._id.toString() !== userId.toString());

        return {
          ...conversation.toJSON(),
          lastMessage: lastMessagesMap[conversation._id.toString()] || null,
          otherUser,
        };
      });

      const unreadConversationsCount = filteredConversations.filter((conversation: any) => conversation.hasUnread).length;

      const result = {
        conversations: filteredConversations,
        unreadConversationsCount,
      };

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Success",
        data: result,
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
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");
      const userId = user.id;

      const conversation = await ConversationModel.findOne({
        _id: new Types.ObjectId(req.params.conversationId),
      }).populate("users", "firstName lastName email photo persona");

      const messages = await MessageModel.find({
        conversationId: new Types.ObjectId(req.params.conversationId),
      });

      if (!conversation) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "conversation not found",
        });
      }

      const otherUser = conversation.users.filter((user: any) => user._id.toString() !== userId.toString());

      const data = {
        ...conversation.toJSON(),
        messages,
        otherUser: otherUser[0],
      };

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Success",
        data,
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
  get,
  list,
};
