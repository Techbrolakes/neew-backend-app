"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const message_model_1 = require("./models/message.model");
const conversation_model_1 = require("./models/conversation.model");
const frontUser_utils_1 = __importDefault(require("./utils/frontUser.utils"));
const config_1 = __importDefault(require("./utils/config"));
const conversation_core_1 = require("./core/conversation.core");
const user_model_1 = require("./models/user.model");
const socket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: config_1.default.frontUrl,
            credentials: true,
        },
    });
    const onlineUser = new Set();
    io.on("connection", async (socket) => {
        console.log("connect User ", socket.id);
        const token = socket.handshake.auth.token;
        // current user details
        const user = await frontUser_utils_1.default.decodeToken(token);
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
        // Send message
        socket.on("new message", async (data) => {
            let conversation = await conversation_model_1.ConversationModel.findOne({
                $or: [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender },
                ],
            });
            //if conversation is not available
            if (!conversation) {
                await conversation_model_1.ConversationModel.create({
                    sender: data.sender,
                    receiver: data.receiver,
                });
            }
            const newMessage = await message_model_1.MessageModel.create({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                sender: userId,
            });
            await conversation_model_1.ConversationModel.findOneAndUpdate({
                $or: [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender },
                ],
            }, { $push: { messages: newMessage._id } }, { new: true });
            const getConversationMessage = await conversation_model_1.ConversationModel.findOne({
                $or: [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender },
                ],
            })
                .populate("messages")
                .sort({ updatedAt: -1 });
            console.log("getConversationMessage", getConversationMessage);
            io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
            io.to(data?.receiver).emit("message", getConversationMessage?.messages || []);
            //send conversation
            const conversationSender = await (0, conversation_core_1.getConversation)(data?.sender);
            const conversationReceiver = await (0, conversation_core_1.getConversation)(data?.receiver);
            io.to(data?.sender).emit("conversation", conversationSender);
            io.to(data?.receiver).emit("conversation", conversationReceiver);
        });
        //sidebar
        socket.on("sidebar", async (currentUserId) => {
            const conversation = await (0, conversation_core_1.getConversation)(currentUserId);
            socket.emit("conversation", conversation);
        });
        // seen message
        socket.on("seen", async (senderId) => {
            let conversation = await conversation_model_1.ConversationModel.findOne({
                $or: [
                    { sender: userId, receiver: senderId },
                    { sender: senderId, receiver: userId },
                ],
            });
            const conversationMessageId = conversation?.messages || [];
            await message_model_1.MessageModel.updateMany({ _id: { $in: conversationMessageId }, sender: senderId }, { $set: { seen: true } });
            //send conversation
            const conversationSender = await (0, conversation_core_1.getConversation)(user?.id?.toString());
            const conversationReceiver = await (0, conversation_core_1.getConversation)(senderId);
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