"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const notification_model_1 = require("../models/notification.model");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const utils_1 = require("../utils");
const debug = (0, debug_1.default)("project:notification.service");
const markNotificationsAsRead = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const userId = req.user.id;
            if (!userId) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Missing user id",
                });
            }
            const notifications = await notification_model_1.NotificationModel.updateMany({ userId }, { $set: { read: "true" } });
            if (notifications) {
                return response_handler_1.default.sendSuccessResponse({
                    res,
                    message: "Notifications marked as read",
                });
            }
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.BAD_REQUEST,
                error: `${error}`,
            });
        }
    },
];
const getUserNotifications = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const userId = req.user.id;
            if (!userId) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "User not found",
                });
            }
            const notifications = await notification_model_1.NotificationModel.find({ userId }).sort({ createdAt: -1 });
            return response_handler_1.default.sendSuccessResponse({
                res,
                message: "Notifications fetched",
                data: notifications,
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
const getNotifications = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const notifications = await notification_model_1.NotificationModel.find();
            return response_handler_1.default.sendSuccessResponse({
                res,
                message: "Notifications fetched",
                data: notifications,
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
    getNotifications,
    getUserNotifications,
    markNotificationsAsRead,
};
//# sourceMappingURL=notification.service.js.map