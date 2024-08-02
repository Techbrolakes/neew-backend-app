"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const utils_1 = require("../utils");
const conversation_model_1 = require("../models/conversation.model");
const mongoose_1 = require("mongoose");
const message_model_1 = require("../models/message.model");
const conversation_core_1 = __importDefault(require("../core/conversation.core"));
const debug = (0, debug_1.default)("project:conversation.service");
const list = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const userId = user.id;
            const conversations = await conversation_model_1.ConversationModel.find({
                users: { $in: [user.id] },
            })
                .populate("users", "firstName lastName email photo")
                .sort({ updatedAt: -1 });
            // Fetch the last message for each conversation
            const conversationIds = conversations.map((conversation) => conversation._id);
            const messages = await message_model_1.MessageModel.aggregate([
                { $match: { conversationId: { $in: conversationIds } } },
                // { $sort: { createdAt: -1 } }, // Sort messages by creation date in descending order
                {
                    $group: {
                        _id: "$conversationId",
                        lastMessage: { $first: "$$ROOT" }, // Get the first document in each group, which is the latest message
                    },
                },
            ]);
            // Loop through the conversations array to update unread counts and flags
            for (const conversation of conversations) {
                await conversation_core_1.default.updateUnreadCountAndFlag(conversation._id.toString(), userId);
            }
            // Create a map of conversationId to last message
            const lastMessagesMap = messages.reduce((acc, message) => {
                acc[message._id.toString()] = message.lastMessage;
                return acc;
            }, {});
            // Combine conversations with their respective last messages
            const filteredConversations = conversations.map((conversation) => {
                const otherUser = conversation.users.filter((user) => user._id.toString() !== userId.toString());
                return {
                    ...conversation.toJSON(),
                    lastMessage: lastMessagesMap[conversation._id.toString()] || null,
                    otherUser,
                };
            });
            const unreadConversationsCount = filteredConversations.filter((conversation) => conversation.hasUnread).length;
            const result = {
                conversations: filteredConversations,
                unreadConversationsCount,
            };
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Success",
                data: result,
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
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const userId = user.id;
            const conversation = await conversation_model_1.ConversationModel.findOne({
                _id: new mongoose_1.Types.ObjectId(req.params.conversationId),
            }).populate("users", "firstName lastName email photo persona");
            const messages = await message_model_1.MessageModel.find({
                conversationId: new mongoose_1.Types.ObjectId(req.params.conversationId),
            });
            const otherUser = conversation.users.filter((user) => user._id.toString() !== userId.toString());
            const data = {
                ...conversation.toJSON(),
                messages,
                otherUser: otherUser[0],
            };
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Success",
                data,
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
    get,
    list,
};
//# sourceMappingURL=conversation.service.js.map