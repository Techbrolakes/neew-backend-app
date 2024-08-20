import { Server as SocketIOServer } from "socket.io";
import { MessageModel } from "./models/message.model";
import { ConversationModel } from "./models/conversation.model";
import http from "http";
import { Types } from "mongoose";
import frontUserUtils from "./utils/frontUser.utils";
import { getUser } from "./middleware/auth.mw";
import config from "./utils/config";
import { getConversation } from "./core/conversation.core";
import { UserModel } from "./models/user.model";

const socket = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.frontUrl,
      credentials: true,
    },
  });

  const onlineUser = new Set();

  io.on("connection", async (socket) => {
    console.log("connect User ", socket.id);

    const token = socket.handshake.auth.token;

    // current user details
    const decoded = await frontUserUtils.decodeToken(token);
    const user = await getUser(decoded);
    const userId = user._id.toString();

    // create a room
    socket.join(userId);
    onlineUser.add(userId);

    io.emit("onlineUser", Array.from(onlineUser));

    socket.on("message-page", async (userId) => {
      const userDetails = await UserModel.findById(userId).select("-password");

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
      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          { sender: user?._id, receiver: userId },
          { sender: userId, receiver: user?._id },
        ],
      })
        .populate("messages")
        .sort({ updatedAt: -1 });

      socket.emit("message", getConversationMessage?.messages || []);
    });

    // Send message
    socket.on("new message", async (data) => {
      let conversation = await ConversationModel.findOne({
        $or: [
          { sender: data?.sender, receiver: data?.receiver },
          { sender: data?.receiver, receiver: data?.sender },
        ],
      });

      //if conversation is not available
      if (!conversation) {
        await ConversationModel.create({
          sender: data.sender,
          receiver: data.receiver,
        });
      }

      const newMessage = await MessageModel.create({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        sender: userId,
      });

      await ConversationModel.findOneAndUpdate(
        {
          $or: [
            { sender: data?.sender, receiver: data?.receiver },
            { sender: data?.receiver, receiver: data?.sender },
          ],
        },
        { $push: { messages: newMessage._id } },
        { new: true },
      );

      const getConversationMessage = await ConversationModel.findOne({
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
      const conversationSender = await getConversation(data?.sender);
      const conversationReceiver = await getConversation(data?.receiver);

      io.to(data?.sender).emit("conversation", conversationSender);
      io.to(data?.receiver).emit("conversation", conversationReceiver);
    });

    //sidebar
    socket.on("sidebar", async (currentUserId) => {
      const conversation = await getConversation(currentUserId);

      socket.emit("conversation", conversation);
    });

    // seen message
    socket.on("seen", async (senderId) => {
      let conversation = await ConversationModel.findOne({
        $or: [
          { sender: userId, receiver: senderId },
          { sender: senderId, receiver: userId },
        ],
      });

      const conversationMessageId = conversation?.messages || [];

      await MessageModel.updateMany({ _id: { $in: conversationMessageId }, sender: senderId }, { $set: { seen: true } });

      //send conversation
      const conversationSender = await getConversation(user?._id?.toString());
      const conversationReceiver = await getConversation(senderId);

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

export default socket;
