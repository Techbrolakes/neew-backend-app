import mongoose, { Schema } from "mongoose";

export interface IConversion {
  lastMessageAt: Date;
  users: string[];
  messages: string[];
  unreadCount: number;
  hasUnread: boolean;
}

const schema: Schema = new mongoose.Schema(
  {
    hasUnread: { default: false, type: Boolean },
    lastMessageAt: { default: Date.now, type: Date },
    messages: { ref: "Message", type: [mongoose.Types.ObjectId] },
    unreadCount: { default: 0, type: Number },
    users: { ref: "User", type: [mongoose.Types.ObjectId] },
  },
  {
    timestamps: true,
  },
);

export interface IConversionDocument extends mongoose.Document, IConversion {}

export const ConversationModel = mongoose.model<IConversionDocument>("Conversation", schema);
