import mongoose, { Schema, Types } from "mongoose";

export interface IConversion {
  messages: string[];
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
}

const schema: Schema = new mongoose.Schema(
  {
    messages: [{ type: mongoose.Schema.ObjectId, ref: "Message" }],
    sender: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    receiver: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  },
);

export interface IConversionDocument extends mongoose.Document, IConversion {}

export const ConversationModel = mongoose.model<IConversionDocument>("Conversation", schema);
