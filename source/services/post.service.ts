import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { body, param } from "express-validator";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import authMw from "../middleware/auth.mw";
import PostCore from "../core/post.core";
import { query } from "express-validator";
import { Types } from "mongoose";
import { throwIfUndefined } from "../utils";
import { NotificationModel } from "../models/notification.model";
import { PostModel } from "../models/post.model";
import redis from "../init/redisInit";

const debug = Debug("project:post.service");

const replyComment = [
  authMw,
  body("commentId").isMongoId().withMessage("CommentId must be a valid id"),
  body("reply").isString().withMessage("Reply must be a string"),
  body("postId").isMongoId().withMessage("PostId must be a valid id"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const post = await PostModel.findById(req.body.postId);

      if (!post) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Post not found",
        });
      }

      let commentFound = false;

      const comment: any = await PostModel.findOne({
        "comments._id": req.body.commentId,
      }).lean();

      console.log(comment.comments);

      // Find the comment and add the reply
      post.comments.forEach((comment: any) => {
        if (comment._id.toString() === req.body.commentId) {
          comment.replies.push({
            reply: req.body.reply,
            user: user.id,
          });
          commentFound = true;
        }
      });

      if (!commentFound) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Comment not found",
        });
      }

      // Create a notification for the reply
      post.comments.forEach(async (comment: any) => {
        if (comment._id.toString() === req.body.commentId) {
          NotificationModel.create({
            message: `New reply on your comment`,
            notificationType: "reply",
            postId: post._id,
            userId: comment.user,
          });
        }
      });

      // Update the post document in the database
      await PostModel.updateOne({ _id: req.body.postId }, { $set: { comments: post.comments } });

      // Invalidate all cached post data
      const keys = await redis.keys("allPosts:*"); // Fetch all matching keys
      if (keys.length > 0) {
        await redis.del(keys); // Delete all matching cache keys
        console.log("Cache invalidated for allPosts");
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "Reply added",
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

const getLikesUsers = [
  authMw,
  param("postId").isMongoId().withMessage("PostId must be a valid id"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const likeUsers = await PostCore.getLikesUsers(new Types.ObjectId(req.params.postId));

      // Invalidate all cached post data
      const keys = await redis.keys("allPosts:*"); // Fetch all matching keys
      if (keys.length > 0) {
        await redis.del(keys); // Delete all matching cache keys
        console.log("Cache invalidated for allPosts");
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Likes fetched successfully",
        data: likeUsers,
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

const addLike = [
  authMw,
  body("postId").isString().withMessage("PostId must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");
      const postId = req.body.postId;

      const post = await PostCore.getPostById(postId);

      if (!post) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Post not found",
        });
      }

      const updatedPost = await PostCore.likePost({
        postId,
        userId: new Types.ObjectId(user.id),
      });

      // Invalidate all cached post data
      const keys = await redis.keys("allPosts:*"); // Fetch all matching keys
      if (keys.length > 0) {
        await redis.del(keys); // Delete all matching cache keys
        console.log("Cache invalidated for allPosts");
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "Post liked",
        data: updatedPost,
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

const deletePost = [
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const post = await PostCore.getPostById(new Types.ObjectId(req.params.postId));

      if (!post) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Post not found",
        });
      }

      await PostCore.deletePost(new Types.ObjectId(req.params.postId));

      // Invalidate all cached post data
      const keys = await redis.keys("allPosts:*"); // Fetch all matching keys
      if (keys.length > 0) {
        await redis.del(keys); // Delete all matching cache keys
        console.log("Cache invalidated for allPosts");
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Post deleted",
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

const edit = [
  authMw,
  body("postId").isString().withMessage("PostId must be a string"),
  body("content").isString().optional().withMessage("Content must be a string"),
  body("image").isString().optional().withMessage("Image must be a string"),
  body("mentions").isArray().optional().withMessage("Mentions must be an array"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const post = await PostCore.getPostById(req.body.postId);

      if (!post) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Post not found",
        });
      }

      const updatedPost = await PostCore.edit({
        postId: req.body.postId,
        content: req.body.content,
        image: req.body.image,
        mentions: req.body.mentions,
      });

      // Invalidate all cached post data
      const keys = await redis.keys("allPosts:*"); // Fetch all matching keys
      if (keys.length > 0) {
        await redis.del(keys); // Delete all matching cache keys
        console.log("Cache invalidated for allPosts");
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Post updated",
        data: updatedPost,
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

const addComment = [
  authMw,
  body("postId").isString().withMessage("PostId must be a string"),
  body("comment").isString().withMessage("Comment must be a string"),
  body("mentions").isArray().optional().withMessage("Mentions must be an array"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      if (!user) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.UNAUTHORIZED,
          error: "Unauthorized",
        });
      }

      const post = await PostCore.getPostById(req.body.postId);

      if (!post) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Post not found",
        });
      }

      const comment = await PostCore.addComment({
        postId: req.body.postId,
        comment: req.body.comment,
        userId: new Types.ObjectId(user.id),
        mentions: req.body.mentions,
      });

      if (comment) {
        // loop through mentions and create notification
        if (req.data.mentions && req.data.mentions.length > 0) {
          const notifications = req.data.mentions.map(async (mention: string) => {
            const notification = await NotificationModel.create({
              message: `${user.firstName} ${user.lastName} mentioned you in a comment`,
              notificationType: "mentions",
              read: "false",
              userId: mention,
            });

            return notification;
          });

          await Promise.all(notifications);
        }
      }

      // Invalidate all cached post data
      const keys = await redis.keys("allPosts:*"); // Fetch all matching keys
      if (keys.length > 0) {
        await redis.del(keys); // Delete all matching cache keys
        console.log("Cache invalidated for allPosts");
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.CREATED,
        message: "Comment added",
        data: comment,
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
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const postId = new Types.ObjectId(req.params.postId);

      const post = await PostCore.getPostById(postId);

      if (!post) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Post not found",
        });
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Post fetched",
        data: post,
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
  body("content").isString().withMessage("Content must be a string"),
  body("image").optional().isString().withMessage("Image must be a string"),
  body("mentions").optional().isArray().withMessage("Mentions must be an array"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const newPost = await PostCore.create({
        content: req.body.content,
        creator: new Types.ObjectId(user.id),
        image: req.body.image,
        mentions: req.body.mentions,
      });

      // loop through mentions and create notification
      if (newPost) {
        if (req.body.mentions && req.body.mentions.length > 0) {
          const notifications = req.body.mentions.map(async (mention: string) => {
            const notification = await NotificationModel.create({
              message: `${user.firstName} ${user.lastName} mentioned you in a post`,
              notificationType: "mentions",
              postId: newPost._id,
              read: "false",
              userId: mention,
            });

            return notification;
          });

          await Promise.all(notifications);
        }
      }

      // Invalidate all cached post data
      const keys = await redis.keys("allPosts:*"); // Fetch all matching keys
      if (keys.length > 0) {
        await redis.del(keys); // Delete all matching cache keys
        console.log("Cache invalidated for allPosts");
      }

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

const userPosts = [
  authMw,
  param("userId").isMongoId().withMessage("userId must be a valid id"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const posts = await PostCore.find(req, req.data.userId);

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Post fetched",
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

const getPosts = [
  authMw,
  query("perpage").isNumeric().optional().withMessage("Perpage must be a number"),
  query("page").isNumeric().optional().withMessage("Page must be a number"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const posts = await PostCore.getAllPosts(req);

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Posts fetched",
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
  userPosts,
  create,
  get,
  addComment,
  edit,
  deletePost,
  addLike,
  getLikesUsers,
  replyComment,
  getPosts,
};
