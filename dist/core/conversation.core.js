"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversation = void 0;
const conversation_model_1 = require("../models/conversation.model");
async function getConversation(currentUserId) {
    if (currentUserId) {
        const currentUserConversation = await conversation_model_1.ConversationModel.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        })
            .sort({ updatedAt: -1 })
            .populate("messages")
            .populate("sender")
            .populate("receiver");
        const conversation = currentUserConversation.map((conv) => {
            const countUnseenMsg = conv?.messages?.reduce((preve, curr) => {
                const msgByUserId = curr?.sender?.toString();
                if (msgByUserId !== currentUserId) {
                    return preve + (curr?.seen ? 0 : 1);
                }
                else {
                    return preve;
                }
            }, 0);
            return {
                _id: conv?._id,
                sender: conv?.sender,
                receiver: conv?.receiver,
                unseenMsg: countUnseenMsg,
                lastMsg: conv.messages[conv?.messages?.length - 1],
            };
        });
        return conversation;
    }
    else {
        return [];
    }
}
exports.getConversation = getConversation;
//# sourceMappingURL=conversation.core.js.map