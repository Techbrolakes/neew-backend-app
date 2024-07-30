"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const user_model_1 = require("../models/user.model");
const follow_model_1 = require("../models/follow.model");
const notification_model_1 = require("../models/notification.model");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const debug = (0, debug_1.default)("project:follow.service");
const getFollowers = [
    auth_mw_1.default,
    (0, express_validator_1.query)("page").optional().isNumeric().withMessage("Page must be a number"),
    (0, express_validator_1.query)("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const { page, perpage } = req.query;
            const userId = req.params.userId;
            const user = await user_model_1.UserModel.findById(userId);
            if (!user) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "User not found",
                });
            }
            const [followers, following, total] = await Promise.all([
                follow_model_1.FollowModel.find({ userId })
                    .select("-__v -userId")
                    .limit(perpage)
                    .skip(page * perpage - perpage)
                    .lean(),
                follow_model_1.FollowModel.find({ followerId: userId })
                    .select("-__v -followerId")
                    .limit(perpage)
                    .skip(page * perpage - perpage)
                    .lean(),
                follow_model_1.FollowModel.countDocuments({ userId }),
            ]);
            const pagination = await (0, utils_1.paginationUtil)({ total, page, perpage });
            return response_handler_1.default.sendSuccessResponse({
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
const followUser = [
    auth_mw_1.default,
    (0, express_validator_1.body)("followee").isString().withMessage("Followee is required"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const follower = req.user.id;
            const { followee } = req.body;
            const user = await user_model_1.UserModel.findOne({ _id: followee });
            if (!user) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "User not found",
                });
            }
            const followerUser = await user_model_1.UserModel.findById(follower);
            if (!followerUser) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Follower not found",
                });
            }
            const followerExists = await follow_model_1.FollowModel.findOne({
                followerId: follower,
                userId: followee,
            });
            if (followerExists) {
                await follow_model_1.FollowModel.findByIdAndDelete(followerExists._id);
            }
            else {
                await follow_model_1.FollowModel.create({
                    followerId: followerUser?._id,
                    userId: followee,
                });
                await notification_model_1.NotificationModel.create({
                    message: `${followerUser?.firstName + " " + followerUser?.lastName} started following you`,
                    notificationType: "follow",
                    userId: followee,
                });
            }
            return response_handler_1.default.sendSuccessResponse({
                res,
                message: followerExists === null ? "User followed" : "User unfollowed",
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
    followUser,
    getFollowers,
};
//# sourceMappingURL=follow.service.js.map