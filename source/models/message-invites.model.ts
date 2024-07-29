import mongoose from "mongoose";

export interface IMessageInvite {
  sender: string;
  receiver: string;
  inviteStatus: "pending" | "accepted" | "rejected";
}

const schema = new mongoose.Schema(
  {
    inviteStatus: {
      default: "pending",
      required: true,
      type: String,
    },
    receiver: { ref: "User", type: mongoose.Types.ObjectId },
    sender: { ref: "User", type: mongoose.Types.ObjectId },
  },
  {
    timestamps: true,
  },
);

// A document type combining IMessageInvite and Document interfaces
export interface IMessageInviteDocument extends mongoose.Document, IMessageInvite {}

// A model type combining IMessageInviteDocument and Model interfaces
export const MessageInviteModel = mongoose.model<IMessageInviteDocument>("MessageInvite", schema);
