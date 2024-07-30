"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_model_1 = require("../models/conversation.model");
const message_model_1 = require("../models/message.model");
async function updateUnreadCountAndFlag(conversationId, userId) {
    try {
        // Count unread messages where senderId is not equal to userId
        const unreadCount = await message_model_1.MessageModel.countDocuments({
            conversationId,
            senderId: { $ne: userId },
            status: "delivered",
        });
        // Determine if there are any unread messages
        const hasUnread = unreadCount > 0;
        // Update the conversation with the unread count and flag
        await conversation_model_1.ConversationModel.findByIdAndUpdate(conversationId, { hasUnread, unreadCount }, { new: true });
    }
    catch (error) {
        console.error(`Error updating unread count and flag for conversation ${conversationId}:`, error);
        throw error;
    }
}
const conversationCore = {
    updateUnreadCountAndFlag,
};
exports.default = conversationCore;
//# sourceMappingURL=conversation.core.js.map