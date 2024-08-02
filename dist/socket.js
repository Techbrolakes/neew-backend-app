"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const message_model_1 = require("./models/message.model");
const conversation_model_1 = require("./models/conversation.model");
const socket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Adjust the origin to match your frontend... or use "*" to allow all origins
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        // Listen for new messages
        socket.on("sendMessage", async (messageData) => {
            const { text, image, conversationId, senderId } = messageData;
            // Save the message to the database
            const message = new message_model_1.MessageModel({
                text,
                image,
                conversationId,
                senderId,
                status: "delivered",
            });
            await message.save();
            // Emit the new message to all clients in the conversation
            io.to(conversationId.toString()).emit("messageReceived", message);
            // Update unread count and last message timestamp
            await conversation_model_1.ConversationModel.updateOne({ _id: conversationId }, {
                $set: { lastMessageAt: new Date() },
                $inc: { unreadCount: 1 },
            });
        });
        // Join a conversation room
        socket.on("joinConversation", (conversationId) => {
            socket.join(conversationId);
        });
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });
    server.listen(9002, () => {
        console.log("Socket.IO start listening to port: 9002");
    });
    return io;
};
exports.default = socket;
//# sourceMappingURL=socket.js.map