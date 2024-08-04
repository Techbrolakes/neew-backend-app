import { Server as SocketIOServer } from "socket.io";
import { MessageModel } from "./models/message.model";
import { ConversationModel } from "./models/conversation.model";
import http from "http";

const socket = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust origin as necessary for security
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join a conversation room
    socket.on("joinConversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Send a message
    socket.on("sendMessage", async (messageData) => {
      const { text, image, conversationId, senderId } = messageData;

      try {
        // Create and save the message
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
        // Update messages status to seen
        await MessageModel.updateMany({ conversationId, status: "delivered" }, { $set: { status: "seen" } });

        // Update conversation unread count and seen status
        const conversation = await ConversationModel.findByIdAndUpdate(
          conversationId,
          { unreadCount: 0, hasUnread: false },
          { new: true },
        ).lean();

        // Emit the updated conversation to all clients in the conversation
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
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export default socket;
