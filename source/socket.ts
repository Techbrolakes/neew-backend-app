import { Server as SocketIOServer } from "socket.io";
import { MessageModel } from "./models/message.model";
import { ConversationModel } from "./models/conversation.model";

const socket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for new messages
    socket.on("sendMessage", async (messageData) => {
      const { text, image, conversationId, senderId } = messageData;

      // Save the message to the database
      const message = new MessageModel({
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
      await ConversationModel.updateOne(
        { _id: conversationId },
        {
          $set: { lastMessageAt: new Date() },
          $inc: { unreadCount: 1 },
        },
      );
    });

    // Join a conversation room
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

export default socket;
