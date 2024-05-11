import express from "express";
import Debug from "debug";
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

const getLikesUsers = [
  authMw,
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const likeUsers = await PostCore.getLikesUsers(new Types.ObjectId(req.params.postId));

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
      });

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

      const postId = req.body.postId;

      const post = await PostCore.getPostById(postId);

      if (!post) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.NOT_FOUND,
          error: "Post not found",
        });
      }

      const comment = await PostCore.addComment({
        postId,
        comment: req.body.comment,
        creator: new Types.ObjectId(user.id),
      });

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

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Post fetched successfully",
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
  list,
  create,
  getPosts,
  get,
  addComment,
  edit,
  deletePost,
  addLike,
  getLikesUsers,
};
