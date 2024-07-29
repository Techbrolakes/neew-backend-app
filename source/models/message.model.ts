import mongoose from "mongoose";

export interface IMessage {
  text: string;
  image: string;
  conversationId: string;
  senderId: string;
  status: "delivered" | "seen"; // Status field with possible values
}

const schema = new mongoose.Schema(
  {
    conversationId: { ref: "Conversation", type: mongoose.Types.ObjectId },
    image: { required: false, type: String },
    senderId: { ref: "User", type: mongoose.Types.ObjectId },
    status: { default: "delivered", enum: ["delivered", "seen"], type: String },
    text: { required: false, type: String },
  },
  {
    timestamps: true,
  },
);

// A document type combining IMessage and Document interfaces
export interface IMessageDocument extends mongoose.Document, IMessage {}

// A model type combining IMessageDocument and Model interfaces
export const MessageModel = mongoose.model<IMessageDocument>("Message", schema);
