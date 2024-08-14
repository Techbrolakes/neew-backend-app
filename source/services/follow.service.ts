import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { UserModel } from "../models/user.model";
import { FollowModel } from "../models/follow.model";
import { NotificationModel } from "../models/notification.model";
import authMw from "../middleware/auth.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { paginationUtil, throwIfUndefined } from "../utils";
import { body, query } from "express-validator";

const debug = Debug("project:follow.service");

const getFollowers = [
  authMw,
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const { page, perpage } = req.query as any;

      const userId = req.params.userId;

      const user = await UserModel.findById(userId);

      if (!user) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "User not found",
        });
      }

      const [followers, following, total] = await Promise.all([
        FollowModel.find({ userId })
          .select("-__v -userId")
          .limit(perpage)
          .skip(page * perpage - perpage)
          .lean(),

        FollowModel.find({ followerId: userId })
          .select("-__v -followerId")
          .limit(perpage)
          .skip(page * perpage - perpage)
          .lean(),

        FollowModel.countDocuments({ userId }),
      ]);

      const pagination = await paginationUtil({ total, page, perpage });

      return ResponseHandler.sendSuccessResponse({
        res,
        message: "Followers fetched",
        data: {
          followers,
          following,
          followersCount: followers.length,
          followingCount: following.length,
        },
        pagination,
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

const followUser = [
  authMw,
  body("followee").isString().withMessage("Followee is required"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const follower = req.user.id;

      const { followee } = req.body;

      const user = await UserModel.findOne({ _id: followee });

      if (!user) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "User not found",
        });
      }

      const followerUser = await UserModel.findById(follower);

      if (!followerUser) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Follower not found",
        });
      }

      const followerExists = await FollowModel.findOne({
        followerId: follower,
        userId: followee,
      });

      if (followerExists) {
        await FollowModel.findByIdAndDelete(followerExists._id);
      } else {
        await FollowModel.create({
          followerId: followerUser?._id,
          userId: followee,
        });

        await NotificationModel.create({
          message: `${followerUser?.firstName + " " + followerUser?.lastName} started following you`,
          notificationType: "follow",
          userId: followee,
        });
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        message: followerExists === null ? "User followed" : "User unfollowed",
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
  followUser,
  getFollowers,
};
