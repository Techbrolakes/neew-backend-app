import mongoose, { Schema, Types } from "mongoose";

export interface INotification {
  userId: string;
  message: string;
  notificationType: "like" | "comment" | "follow";
  read: string;
}

const schema = new Schema(
  {
    message: { required: true, type: String },
    notificationType: { required: true, type: String },

    read: {
      default: "false",
      enum: ["false", "true"],
      type: String,
    },
    userId: { required: true, type: String },
  },
  {
    timestamps: true,
  },
);

// A document type combining INotification and Document interfaces
export interface INotificationDocument extends mongoose.Document, INotification {}

// A model type combining INotificationDocument and Model interfaces
export const NotificationModel = mongoose.model<INotificationDocument>("Notification", schema);
