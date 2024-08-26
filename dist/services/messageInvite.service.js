"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const notification_model_1 = require("../models/notification.model");
const message_invites_model_1 = require("../models/message-invites.model");
const utils_1 = require("../utils");
const mongoose_1 = require("mongoose");
const conversation_model_1 = require("../models/conversation.model");
const user_model_1 = require("../models/user.model");
const debug = (0, debug_1.default)("project:messageInvite.service");
const senderlist = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const messageInvites = await message_invites_model_1.MessageInviteModel.find({
                inviteStatus: "pending",
                sender: new mongoose_1.Types.ObjectId(user.id),
            })
                .populate("receiver", "firstName lastName email")
                .populate("sender", "firstName lastName email");
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Message Invites fetched",
                data: messageInvites,
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
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const messageInvites = await message_invites_model_1.MessageInviteModel.find({
                inviteStatus: "pending",
                receiver: new mongoose_1.Types.ObjectId(user.id),
            }).populate("sender", "firstName lastName email");
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Message Invites fetched",
                data: messageInvites,
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
const put = [
    auth_mw_1.default,
    (0, express_validator_1.body)("inviteId").isString().withMessage("Invite Id must be a string"),
    (0, express_validator_1.body)("inviteStatus").isString().withMessage("Invite Status must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const currentUser = await user_model_1.UserModel.findById(user.id);
            const messageInvite = await message_invites_model_1.MessageInviteModel.findById(req.data.inviteId);
            if (!messageInvite) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Message invite not found",
                });
            }
            if (req.data.inviteStatus === "accepted") {
                await Promise.all([
                    message_invites_model_1.MessageInviteModel.findOneAndUpdate({ _id: req.data.inviteId }, { inviteStatus: "accepted" }),
                    conversation_model_1.ConversationModel.create({
                        receiver: messageInvite.receiver,
                        sender: messageInvite.sender,
                    }),
                    notification_model_1.NotificationModel.create({
                        message: `${currentUser.firstName} ${currentUser.lastName} accepted your connect request`,
                        notificationType: "message-invite",
                        userId: messageInvite.sender,
                    }),
                ]);
                return response_handler_1.default.sendSuccessResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.OK,
                    message: "Message Invite Accepted",
                });
            }
            if (req.data.inviteStatus === "rejected") {
                await Promise.all([
                    message_invites_model_1.MessageInviteModel.findOneAndUpdate({ _id: req.data.inviteId }, { inviteStatus: "rejected" }),
                    notification_model_1.NotificationModel.create({
                        message: `${currentUser.firstName} ${currentUser.lastName} rejected your connect request`,
                        notificationType: "message-invite",
                        userId: messageInvite.sender,
                    }),
                ]);
                return response_handler_1.default.sendSuccessResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.OK,
                    message: "Message Invite Rejected",
                });
            }
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                data: messageInvite,
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
    (0, express_validator_1.body)("receiver").isString().withMessage("Receiver must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const receiverDetails = await user_model_1.UserModel.findById(req.body.receiver);
            if (!receiverDetails) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "Receiver not found",
                });
            }
            debug("receiverDetails", receiverDetails);
            const existingMessageInvite = await message_invites_model_1.MessageInviteModel.findOne({
                receiver: req.body.receiver,
                sender: new mongoose_1.Types.ObjectId(user.id),
            });
            if (existingMessageInvite) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.BAD_REQUEST,
                    error: "Message request already sent to user",
                });
            }
            const newMessageInvite = await message_invites_model_1.MessageInviteModel.create({
                receiver: req.body.receiver,
                sender: new mongoose_1.Types.ObjectId(user.id),
            });
            await notification_model_1.NotificationModel.create({
                message: `You sent a connect request to ${receiverDetails.firstName} ${receiverDetails.lastName} once they accept you can start chatting`,
                notificationType: "sent-invite",
                userId: user.id,
            });
            await notification_model_1.NotificationModel.create({
                message: "You have a new connect request",
                notificationType: "message-invite",
                userId: req.body.receiver,
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "Message invite sent",
                data: newMessageInvite,
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
    create,
    list,
    put,
    senderlist,
};
//# sourceMappingURL=messageInvite.service.js.map