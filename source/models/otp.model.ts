import mongoose, { Schema } from "mongoose";

export interface IOtp {
  otp: number;
  userId?: string;
  expiresIn: number;
}

export const OtpSchema: Schema = new Schema(
  {
    otp: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresIn: { type: Date },
  },
  { timestamps: true },
);

// A document type combining IUser and Document interfaces
export interface IOtpDocument extends mongoose.Document, IOtp {}

// A model type extending the mongoose Model interface
export const OtpModel = mongoose.model<IOtpDocument>("Otp", OtpSchema);
