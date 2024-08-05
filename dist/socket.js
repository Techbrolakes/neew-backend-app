"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const message_model_1 = require("./models/message.model");
const conversation_model_1 = require("./models/conversation.model");
const user_model_1 = require("./models/user.model");
const socket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Adjust origin as necessary for security
            methods: ["GET", "POST"],
        },
    });
    // To track connected users
    const onlineUsers = new Map();
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        // online statuse
        socket.on("online", async (userId) => {
            try {
                onlineUsers.set(userId, socket.id); // Track the user's socket ID
                await user_model_1.UserModel.findByIdAndUpdate(userId, { online: true });
            }
            catch (error) {
                console.error("Error updating user online status:", error);
                socket.emit("error", { message: "Failed to update online status" });
            }
        });
        // Join a conversation room
        socket.on("joinConversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
        });
        // Send a message
        socket.on("sendMessage", async (messageData) => {
            const { text, image, conversationId, senderId } = messageData;
            try {
                // Create and save the message
                const message = new message_model_1.MessageModel({
                    text,
                    image,
                    conversationId,
                    senderId,
                });
                await message.save();
                // Emit the new message to all clients in the conversation
                io.to(conversationId).emit("messageReceived", message);
                // Update conversation with last message timestamp and unread count
                await conversation_model_1.ConversationModel.findByIdAndUpdate(conversationId, {
                    $set: { lastMessageAt: new Date(), hasUnread: true },
                    $inc: { unreadCount: 1 },
                    $push: { messages: message._id },
                }, { new: true });
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        // Get all messages for a conversation
        socket.on("getAllMessages", async (conversationId) => {
            try {
                const messages = await message_model_1.MessageModel.find({ conversationId }).sort({ createdAt: 1 }).lean();
                socket.emit("allMessages", messages);
            }
            catch (error) {
                console.error("Error fetching messages:", error);
                socket.emit("error", { message: "Failed to fetch messages" });
            }
        });
        // Mark messages as seen
        socket.on("markMessagesSeen", async (conversationId) => {
            try {
                // Update messages status to seen
                await message_model_1.MessageModel.updateMany({ conversationId, status: "delivered" }, { $set: { status: "seen" } });
                // Update conversation unread count and seen status
                const conversation = await conversation_model_1.ConversationModel.findByIdAndUpdate(conversationId, { unreadCount: 0, hasUnread: false }, { new: true }).lean();
                // Emit the updated conversation to all clients in the conversation
                io.to(conversationId).emit("conversationUpdated", conversation);
            }
            catch (error) {
                console.error("Error marking messages as seen:", error);
                socket.emit("error", { message: "Failed to mark messages as seen" });
            }
        });
        // Handle socket errors
        socket.on("error", (error) => {
            console.error("Socket error:", error);
            socket.emit("error", { message: "Socket encountered an error" });
        });
        // Handle socket disconnection
        socket.on("disconnect", async () => {
            console.log("User disconnected:", socket.id);
            // Find the user associated with the disconnected socket ID
            const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
            if (userId) {
                try {
                    await user_model_1.UserModel.findByIdAndUpdate(userId, { online: false });
                    onlineUsers.delete(userId); // Remove from the tracked online users
                }
                catch (error) {
                    console.error("Error updating user offline status:", error);
                }
            }
        });
    });
    return io;
};
exports.default = socket;
//# sourceMappingURL=socket.js.map