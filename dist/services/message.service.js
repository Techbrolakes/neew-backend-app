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
const utils_1 = require("../utils");
const message_model_1 = require("../models/message.model");
const conversation_model_1 = require("../models/conversation.model");
const debug = (0, debug_1.default)("project:message.service");
const seen = [
    auth_mw_1.default,
    (0, express_validator_1.body)("conversationId").isString().withMessage("ConversationId must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const conversation = await conversation_model_1.ConversationModel.findById(req.data.conversationId);
            if (!conversation) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "conversation not found",
                });
            }
            await message_model_1.MessageModel.updateMany({ conversationId: req.data.conversationId, senderId: { $ne: user.id } }, { $set: { status: "seen" } });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "updated",
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
const post = [
    auth_mw_1.default,
    (0, express_validator_1.body)("conversationId").isString().withMessage("ConversationId must be a string"),
    (0, express_validator_1.body)("text").isString().withMessage("Text must be a string"),
    (0, express_validator_1.body)("image").isString().withMessage("Image must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const newMessage = await message_model_1.MessageModel.create({
                conversationId: req.data.conversationId,
                image: req.data.image,
                senderId: user.id,
                text: req.data.text,
            });
            await conversation_model_1.ConversationModel.findByIdAndUpdate(req.data.conversationId, {
                $push: { messages: newMessage._id },
                lastMessageAt: new Date(),
            }, { new: true })
                .populate("users")
                .populate({
                path: "messages",
                populate: { path: "seen" },
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Success",
                data: newMessage,
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
    post,
    seen,
};
//# sourceMappingURL=message.service.js.map