"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const response_handler_1 = __importDefault(require("../../utils/response-handler"));
const appDefaults_constant_1 = require("../../constants/appDefaults.constant");
const auth_mw_1 = __importDefault(require("../../middleware/auth.mw"));
const post_core_1 = __importDefault(require("../../core/post.core"));
const express_validator_2 = require("express-validator");
const mongoose_1 = require("mongoose");
const utils_1 = require("../../utils");
const debug = (0, debug_1.default)("project:post.service");
const getLikesUsers = [
    auth_mw_1.default,
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
            const comment = await post_core_1.default.addComment({
                postId,
                comment: req.body.comment,
                creator: new mongoose_1.Types.ObjectId(user.id),
            });
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
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Post fetched successfully",
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
    (0, express_validator_1.body)("image").isString().withMessage("Image must be a string"),
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
const list = [
    auth_mw_1.default,
    (0, express_validator_2.query)("perpage").isNumeric().withMessage("Perpage must be a number").optional(),
    (0, express_validator_2.query)("page").isNumeric().withMessage("Page must be a number").optional(),
    (0, express_validator_2.query)("dateFrom").isString().withMessage("DateFrom must be a string").optional(),
    (0, express_validator_2.query)("dateTo").isString().withMessage("DateTo must be a string").optional(),
    (0, express_validator_2.query)("period").isString().withMessage("Period must be a string").optional(),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const posts = await post_core_1.default.find(req, new mongoose_1.Types.ObjectId(user.id));
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Users fetched successfully",
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
const getAll = [
    auth_mw_1.default,
    (0, express_validator_2.query)("perpage").isNumeric().optional().withMessage("Perpage must be a number"),
    (0, express_validator_2.query)("page").isNumeric().optional().withMessage("Page must be a number"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const posts = post_core_1.default.getAllPosts(req);
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
    list,
    create,
    getAll,
    get,
    addComment,
    edit,
    deletePost,
    addLike,
    getLikesUsers,
};
//# sourceMappingURL=post.service.js.map