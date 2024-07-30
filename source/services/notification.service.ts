import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { NotificationModel } from "../models/notification.model";
import authMw from "../middleware/auth.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { throwIfUndefined } from "../utils";

const debug = Debug("project:notification.service");

const markNotificationsAsRead = [
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const userId = req.user.id;

      if (!userId) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Missing user id",
        });
      }

      const notifications = await NotificationModel.updateMany({ userId }, { $set: { read: "true" } });

      if (notifications) {
        return ResponseHandler.sendSuccessResponse({
          res,
          message: "Notifications marked as read",
        });
      }
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.BAD_REQUEST,
        error: `${error}`,
      });
    }
  },
];

const getUserNotifications = [
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const userId = req.user.id;

      if (!userId) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "User not found",
        });
      }

      const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });

      return ResponseHandler.sendSuccessResponse({
        res,
        message: "Notifications fetched",
        data: notifications,
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

const getNotifications = [
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const notifications = await NotificationModel.find();

      return ResponseHandler.sendSuccessResponse({
        res,
        message: "Notifications fetched",
        data: notifications,
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
  getNotifications,
  getUserNotifications,
  markNotificationsAsRead,
};
