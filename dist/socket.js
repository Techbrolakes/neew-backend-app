"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const message_model_1 = require("./models/message.model");
const conversation_model_1 = require("./models/conversation.model");
const frontUser_utils_1 = __importDefault(require("./utils/frontUser.utils"));
const conversation_core_1 = require("./core/conversation.core");
const user_model_1 = require("./models/user.model");
const socket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });
    const onlineUser = new Set();
    io.on("connection", async (socket) => {
        console.log("connect User ", socket.id);
        const token = socket.handshake.auth.token;
        // current user details
        const user = await frontUser_utils_1.default.decodeAccessToken(token);
        const userId = user.id.toString();
        // create a room
        socket.join(userId);
        onlineUser.add(userId);
        io.emit("onlineUser", Array.from(onlineUser));
        socket.on("message-page", async (userId) => {
            const userDetails = await user_model_1.UserModel.findById(userId).select("-password");
            const payload = {
                id: userDetails?._id,
                firstName: userDetails?.firstName,
                lastName: userDetails?.lastName,
                email: userDetails?.email,
                photo: userDetails?.photo,
                persona: userDetails?.persona,
                online: onlineUser.has(userId),
            };
            socket.emit("message-user", payload);
            //get previous message
            const getConversationMessage = await conversation_model_1.ConversationModel.findOne({
                $or: [
                    { sender: user?.id, receiver: userId },
                    { sender: userId, receiver: user?.id },
                ],
            })
                .populate("messages")
                .sort({ updatedAt: -1 });
            socket.emit("message", getConversationMessage?.messages || []);
        });
        // Updated code for 'new message' event handler
        socket.on("new message", async (data) => {
            try {
                // Find or create the conversation
                let conversation = await conversation_model_1.ConversationModel.findOne({
                    $or: [
                        { sender: data.sender, receiver: data.receiver },
                        { sender: data.receiver, receiver: data.sender },
                    ],
                });
                if (!conversation) {
                    conversation = await conversation_model_1.ConversationModel.create({
                        sender: data.sender,
                        receiver: data.receiver,
                        messages: [],
                    });
                }
                // Create and save the new message
                const newMessage = await message_model_1.MessageModel.create({
                    text: data.text,
                    imageUrl: data.imageUrl,
                    videoUrl: data.videoUrl,
                    sender: data.sender,
                });
                // Add the new message to the conversation
                conversation.messages.push(newMessage._id);
                await conversation.save();
                // Populate the conversation with the updated messages
                const populatedConversation = await conversation_model_1.ConversationModel.findById(conversation._id)
                    .populate("messages")
                    .sort({ updatedAt: -1 });
                // Emit the updated messages list to both sender and receiver
                io.to(data.sender).emit("message", populatedConversation.messages);
                io.to(data.receiver).emit("message", populatedConversation.messages);
                // Update unseen messages count for the sender and receiver
                const unseenMessagesCountSender = await message_model_1.MessageModel.countDocuments({
                    receiver: data.sender,
                    seen: false,
                });
                const unseenMessagesCountReceiver = await message_model_1.MessageModel.countDocuments({
                    receiver: data.receiver,
                    seen: false,
                });
                io.to(data.sender).emit("unseen message count", unseenMessagesCountSender);
                io.to(data.receiver).emit("unseen message count", unseenMessagesCountReceiver);
                // Send conversation updates (optional, if necessary for sidebar updates)
                const conversationSender = await (0, conversation_core_1.getConversation)(data.sender);
                const conversationReceiver = await (0, conversation_core_1.getConversation)(data.receiver);
                io.to(data.sender).emit("conversation", conversationSender);
                io.to(data.receiver).emit("conversation", conversationReceiver);
            }
            catch (error) {
                console.error("Error sending message:", error);
            }
        });
        //sidebar
        socket.on("sidebar", async (currentUserId) => {
            const conversation = await (0, conversation_core_1.getConversation)(currentUserId);
            socket.emit("conversation", conversation);
        });
        // Delete message
        socket.on("delete message", async (data) => {
            try {
                const { messageId, conversationId, userId, otherUserId } = data;
                // Delete the message from the database
                await message_model_1.MessageModel.findByIdAndDelete(messageId);
                // Remove the message from the conversation
                await conversation_model_1.ConversationModel.findByIdAndUpdate(conversationId, {
                    $pull: { messages: messageId },
                });
                // Get the updated conversation, populating the messages and sorting them by the latest
                const updatedConversation = await conversation_model_1.ConversationModel.findById(conversationId).populate("messages").sort({ updatedAt: -1 });
                // Emit the updated message list to both the sender and receiver
                io.to(userId).emit("message deleted", {
                    conversationId,
                    messages: updatedConversation?.messages || [],
                });
                io.to(otherUserId).emit("message deleted", {
                    conversationId,
                    messages: updatedConversation?.messages || [],
                });
                // Update and emit the conversation list for both users
                const conversationSender = await (0, conversation_core_1.getConversation)(userId);
                const conversationReceiver = await (0, conversation_core_1.getConversation)(otherUserId);
                io.to(userId).emit("conversation updated", conversationSender);
                io.to(otherUserId).emit("conversation updated", conversationReceiver);
            }
            catch (error) {
                console.error("Error deleting message:", error);
            }
        });
        // Edit message
        socket.on("edit message", async (data) => {
            try {
                const { messageId, newText, conversationId, userId, otherUserId } = data;
                // Update the message text in the database
                await message_model_1.MessageModel.findByIdAndUpdate(messageId, { text: newText }, { new: true });
                // Get the updated conversation, populating the messages and sorting them by the latest
                const updatedConversation = await conversation_model_1.ConversationModel.findById(conversationId).populate("messages").sort({ updatedAt: -1 });
                // Emit the updated message list to both the sender and receiver
                io.to(userId).emit("message edited", {
                    conversationId,
                    messages: updatedConversation?.messages || [],
                });
                io.to(otherUserId).emit("message edited", {
                    conversationId,
                    messages: updatedConversation?.messages || [],
                });
                // Update and emit the conversation list for both users
                const conversationSender = await (0, conversation_core_1.getConversation)(userId);
                const conversationReceiver = await (0, conversation_core_1.getConversation)(otherUserId);
                io.to(userId).emit("conversation updated", conversationSender);
                io.to(otherUserId).emit("conversation updated", conversationReceiver);
            }
            catch (error) {
                console.error("Error editing message:", error);
            }
        });
        // seen message
        socket.on("seen", async (data) => {
            const { conversationId, senderId } = data;
            // Find the conversation by ID
            const conversation = await conversation_model_1.ConversationModel.findById(conversationId);
            if (!conversation) {
                console.error("Conversation not found");
                return;
            }
            // Update only the messages sent by the other user in this conversation
            const conversationMessageIds = conversation.messages || [];
            await message_model_1.MessageModel.updateMany({ _id: { $in: conversationMessageIds }, sender: senderId, seen: false }, { $set: { seen: true } });
            // Get updated conversation lists
            const conversationSender = await (0, conversation_core_1.getConversation)(userId);
            const conversationReceiver = await (0, conversation_core_1.getConversation)(senderId);
            // Emit the updated conversation list to both the current user and the other user
            io.to(userId).emit("conversation", conversationSender);
            io.to(senderId).emit("conversation", conversationReceiver);
        });
        // Disconnect
        socket.on("disconnect", () => {
            onlineUser.delete(userId);
            console.log("disconnect user ", socket.id);
        });
    });
    return io;
};
exports.default = socket;
//# sourceMappingURL=socket.js.map