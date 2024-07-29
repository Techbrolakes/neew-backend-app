import mongoose, { Schema } from "mongoose";

export interface IFollow {
  followerId: string;
  userId: string;
}

const schema: Schema = new Schema(
  {
    followerId: { required: true, type: String },
    userId: { required: true, type: String },
  },
  {
    timestamps: true,
  },
);

// A document type combining IFollow and Document interfaces
export interface IFollowDocument extends mongoose.Document, IFollow {}

// A model type combining IFollowDocument and Model interfaces
export const FollowModel = mongoose.model<IFollowDocument>("Follow", schema);
