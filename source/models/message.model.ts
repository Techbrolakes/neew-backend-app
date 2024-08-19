import mongoose, { Types } from "mongoose";

export interface IMessage {
  text?: string;
  seen: boolean;
  imageUrl?: string;
  videoUrl?: string;
  sender: Types.ObjectId;
}

const schema = new mongoose.Schema(
  {
    text: { type: String },
    seen: { type: Boolean, default: false },
    imageUrl: { type: String },
    videoUrl: { type: String },
    sender: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

// A document type combining IMessage and Document interfaces
export interface IMessageDocument extends mongoose.Document, IMessage {}

// A model type combining IMessageDocument and Model interfaces
export const MessageModel = mongoose.model<IMessageDocument>("Message", schema);
