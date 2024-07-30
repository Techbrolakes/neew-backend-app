import { ConversationModel } from "../models/conversation.model";
import { MessageModel } from "../models/message.model";

async function updateUnreadCountAndFlag(conversationId: string, userId: string): Promise<void> {
  try {
    // Count unread messages where senderId is not equal to userId
    const unreadCount = await MessageModel.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      status: "delivered",
    });

    // Determine if there are any unread messages
    const hasUnread = unreadCount > 0;

    // Update the conversation with the unread count and flag
    await ConversationModel.findByIdAndUpdate(
      conversationId,
      { hasUnread, unreadCount },
      { new: true }, // Return the updated document
    );
  } catch (error) {
    console.error(`Error updating unread count and flag for conversation ${conversationId}:`, error);
    throw error;
  }
}

const conversationCore = {
  updateUnreadCountAndFlag,
};

export default conversationCore;
