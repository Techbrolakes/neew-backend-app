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
const debug = (0, debug_1.default)("project:messageInvite.service");
const create = [
    auth_mw_1.default,
    (0, express_validator_1.body)("receiver").isString().withMessage("Receiver must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const existingMessageInvite = await message_invites_model_1.MessageInviteModel.findOne({
                receiver: req.data.receiver,
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
                receiver: req.data.receiver,
                sender: new mongoose_1.Types.ObjectId(user.id),
            });
            await notification_model_1.NotificationModel.create({
                message: "You have a new message invite",
                notificationType: "message-invite",
                userId: req.data.receiver,
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
};
//# sourceMappingURL=messageInvite.service.js.map