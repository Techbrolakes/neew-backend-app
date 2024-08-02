"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const post_core_1 = __importDefault(require("../core/post.core"));
const express_validator_2 = require("express-validator");
const mongoose_1 = require("mongoose");
const utils_1 = require("../utils");
const notification_model_1 = require("../models/notification.model");
const post_model_1 = require("../models/post.model");
const debug = (0, debug_1.default)("project:post.service");
const replyComment = [
    auth_mw_1.default,
    (0, express_validator_1.body)("commentId").isMongoId().withMessage("CommentId must be a valid id"),
    (0, express_validator_1.body)("reply").isString().withMessage("Reply must be a string"),
    (0, express_validator_1.body)("postId").isMongoId().withMessage("PostId must be a valid id"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const post = await post_model_1.PostModel.findById(req.body.postId);
            if (!post) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Post not found",
                });
            }
            let commentFound = false;
            const comment = await post_model_1.PostModel.findOne({
                "comments._id": req.body.commentId,
            }).lean();
            console.log(comment.comments);
            // Find the comment and add the reply
            post.comments.forEach((comment) => {
                if (comment._id.toString() === req.body.commentId) {
                    comment.replies.push({
                        reply: req.body.reply,
                        user: user.id,
                    });
                    commentFound = true;
                }
            });
            if (!commentFound) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Comment not found",
                });
            }
            // Create a notification for the reply
            post.comments.forEach(async (comment) => {
                if (comment._id.toString() === req.body.commentId) {
                    notification_model_1.NotificationModel.create({
                        message: `New reply on your comment`,
                        notificationType: "reply",
                        postId: post._id,
                        userId: comment.user,
                    });
                }
            });
            // Update the post document in the database
            await post_model_1.PostModel.updateOne({ _id: req.body.postId }, { $set: { comments: post.comments } });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "Reply added",
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const getLikesUsers = [
    auth_mw_1.default,
    (0, express_validator_1.param)("postId").isMongoId().withMessage("PostId must be a valid id"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const likeUsers = await post_core_1.default.getLikesUsers(new mongoose_1.Types.ObjectId(req.params.postId));
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Likes fetched successfully",
                data: likeUsers,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const addLike = [
    auth_mw_1.default,
    (0, express_validator_1.body)("postId").isString().withMessage("PostId must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const postId = req.body.postId;
            const post = await post_core_1.default.getPostById(postId);
            if (!post) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Post not found",
                });
            }
            const updatedPost = await post_core_1.default.likePost({
                postId,
                userId: new mongoose_1.Types.ObjectId(user.id),
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "Post liked",
                data: updatedPost,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const deletePost = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const post = await post_core_1.default.getPostById(new mongoose_1.Types.ObjectId(req.params.postId));
            if (!post) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Post not found",
                });
            }
            await post_core_1.default.deletePost(new mongoose_1.Types.ObjectId(req.params.postId));
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Post deleted",
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const edit = [
    auth_mw_1.default,
    (0, express_validator_1.body)("postId").isString().withMessage("PostId must be a string"),
    (0, express_validator_1.body)("content").isString().optional().withMessage("Content must be a string"),
    (0, express_validator_1.body)("image").isString().optional().withMessage("Image must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const post = await post_core_1.default.getPostById(req.body.postId);
            if (!post) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Post not found",
                });
            }
            const updatedPost = await post_core_1.default.edit({
                postId: req.body.postId,
                content: req.body.content,
                image: req.body.image,
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Post updated",
                data: updatedPost,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const addComment = [
    auth_mw_1.default,
    (0, express_validator_1.body)("postId").isString().withMessage("PostId must be a string"),
    (0, express_validator_1.body)("comment").isString().withMessage("Comment must be a string"),
    (0, express_validator_1.body)("mentions").isArray().optional().withMessage("Mentions must be an array"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            if (!user) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.UNAUTHORIZED,
                    error: "Unauthorized",
                });
            }
            const post = await post_core_1.default.getPostById(req.body.postId);
            if (!post) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Post not found",
                });
            }
            const comment = await post_core_1.default.addComment({
                postId: req.body.postId,
                comment: req.body.comment,
                userId: new mongoose_1.Types.ObjectId(user.id),
                mentions: req.body.mentions,
            });
            if (comment) {
                // loop through mentions and create notification
                if (req.data.mentions && req.data.mentions.length > 0) {
                    const notifications = req.data.mentions.map(async (mention) => {
                        const notification = await notification_model_1.NotificationModel.create({
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
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "Comment added",
                data: comment,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const get = [
    auth_mw_1.default,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const postId = new mongoose_1.Types.ObjectId(req.params.postId);
            const post = await post_core_1.default.getPostById(postId);
            if (!post) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Post not found",
                });
            }
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Post fetched",
                data: post,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const create = [
    auth_mw_1.default,
    (0, express_validator_1.body)("content").isString().withMessage("Content must be a string"),
    (0, express_validator_1.body)("image").optional().isString().withMessage("Image must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const newPost = await post_core_1.default.create({
                content: req.body.content,
                creator: new mongoose_1.Types.ObjectId(user.id),
                image: req.body.image,
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "Post created",
                data: newPost,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const userPosts = [
    auth_mw_1.default,
    (0, express_validator_1.param)("userId").isMongoId().withMessage("userId must be a valid id"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            console.log(req.data.userId);
            const posts = await post_core_1.default.find(req, req.data.userId);
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Post fetched",
                ...posts,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const getPosts = [
    auth_mw_1.default,
    (0, express_validator_2.query)("perpage").isNumeric().optional().withMessage("Perpage must be a number"),
    (0, express_validator_2.query)("page").isNumeric().optional().withMessage("Page must be a number"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const posts = await post_core_1.default.getAllPosts(req);
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Posts fetched",
                ...posts,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
exports.default = {
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
//# sourceMappingURL=post.service.js.map