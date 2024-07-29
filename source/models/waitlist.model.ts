import mongoose, { Schema } from "mongoose";

export interface IWaitlist {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: string;
  password: string;
  interest: string;
}

const schema: Schema = new mongoose.Schema(
  {
    email: { required: true, type: String, unique: true },
    firstName: { required: true, type: String },
    interest: {
      default: "general_interest",
      enum: ["general_interest", "entrepreneur", "social_progress", "investors", "eco_system_builder"],
      type: String,
    },
    lastName: { required: true, type: String },
    location: { required: true, type: String },
    password: { required: true, type: String },
    phone: { required: false, type: String },
  },
  { timestamps: true },
);

// A document type combining IWaitlist and Document interfaces
export interface IWaitlistDocument extends mongoose.Document, IWaitlist {}

// A model type extending the mongoose Model interface
export const WaitlistModel = mongoose.model<IWaitlistDocument>("Waitlists", schema);
