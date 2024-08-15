import { Server as SocketIOServer } from "socket.io";
import { MessageModel } from "./models/message.model";
import { ConversationModel } from "./models/conversation.model";
import http from "http";
import { UserModel } from "./models/user.model";
import { Types } from "mongoose";

const socket = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust origin as necessary for security
      methods: ["GET", "POST"],
    },
  });

  // To track connected users
  const onlineUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Online status
    socket.on("online", async (userId: string) => {
      try {
        onlineUsers.set(userId, socket.id); // Track the user's socket ID
        await UserModel.findByIdAndUpdate(userId, { online: true });
      } catch (error) {
        console.error("Error updating user online status:", error);
        socket.emit("error", { message: "Failed to update online status" });
      }
    });

    // Join a conversation room
    socket.on("joinConversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Get all conversations
    socket.on("getAllConversations", async (userId: string) => {
      try {
        const conversations = await ConversationModel.find({ users: userId })
          .populate("users", "firstName lastName email photo")
          .sort({ updatedAt: -1 })
          .lean();

        const conversationIds = conversations.map((conv: any) => conv._id);
        const messages = await MessageModel.aggregate([
          { $match: { conversationId: { $in: conversationIds } } },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$conversationId",
              lastMessage: { $first: "$$ROOT" },
            },
          },
        ]);

        const lastMessagesMap = messages.reduce((acc: any, msg: any) => {
          acc[msg._id.toString()] = msg.lastMessage;
          return acc;
        }, {});

        const filteredConversations = conversations.map((conv: any) => {
          const otherUser = conv.users.find((user: any) => user._id.toString() !== userId.toString());
          return {
            ...conv,
            lastMessage: lastMessagesMap[conv._id.toString()] || null,
            otherUser,
          };
        });

        const unreadConversationsCount = filteredConversations.filter((conv: any) => conv.hasUnread).length;

        socket.emit("allConversations", {
          conversations: filteredConversations,
          unreadConversationsCount,
        });
      } catch (error) {
        console.error("Error fetching conversations:", error);
        socket.emit("error", { message: "Failed to fetch conversations" });
      }
    });

    // Get conversation by ID
    socket.on("getConversation", async (userId: string, conversationId: string) => {
      try {
        const conversation = await ConversationModel.findOne({
          _id: new Types.ObjectId(conversationId),
        }).populate("users", "firstName lastName email photo persona");

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        const messages = await MessageModel.find({
          conversationId: new Types.ObjectId(conversationId),
        });

        const otherUser = conversation.users.find((user: any) => user._id.toString() !== userId.toString());

        const data = {
          ...conversation.toJSON(),
          messages,
          otherUser,
        };

        socket.emit("conversation", data);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        socket.emit("error", { message: "Failed to fetch conversation" });
      }
    });

    // Send a message
    socket.on("sendMessage", async (messageData) => {
      const { text, image, conversationId, senderId } = messageData;

      try {
        const message = new MessageModel({
          text,
          image,
          conversationId,
          senderId,
        });

        await message.save();

        // Emit the new message to all clients in the conversation
        io.to(conversationId).emit("messageReceived", message);

        // Update conversation with last message timestamp and unread count
        await ConversationModel.findByIdAndUpdate(
          conversationId,
          {
            $set: { lastMessageAt: new Date(), hasUnread: true },
            $inc: { unreadCount: 1 },
            $push: { messages: message._id },
          },
          { new: true },
        );

        // Notify all clients in the conversation about the updated unread count
        io.to(conversationId).emit("conversationUpdated", {
          conversationId,
          unreadCount: (await ConversationModel.findById(conversationId)).unreadCount,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Get all messages for a conversation
    socket.on("getAllMessages", async (conversationId: string) => {
      try {
        const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 }).lean();

        socket.emit("allMessages", messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        socket.emit("error", { message: "Failed to fetch messages" });
      }
    });

    // Mark messages as seen
    socket.on("markMessagesSeen", async (conversationId: string) => {
      try {
        await MessageModel.updateMany({ conversationId, status: "delivered" }, { $set: { status: "seen" } });

        const conversation = await ConversationModel.findByIdAndUpdate(
          conversationId,
          { unreadCount: 0, hasUnread: false },
          { new: true },
        ).lean();

        // Notify all clients in the conversation about the updated conversation
        io.to(conversationId).emit("conversationUpdated", conversation);
      } catch (error) {
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

      const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];

      if (userId) {
        try {
          await UserModel.findByIdAndUpdate(userId, { online: false });
          onlineUsers.delete(userId); // Remove from the tracked online users
        } catch (error) {
          console.error("Error updating user offline status:", error);
        }
      }
    });
  });

  return io;
};

export default socket;
