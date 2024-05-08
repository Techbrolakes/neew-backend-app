import mongoose, { Schema, Types } from "mongoose";

export interface IPost {
  content: string;
  image?: string;
  creator: string;
  totalLikes: number;
  likesUsers: string[];
  comments: any[];
  numberOfComments: any;
}

const commentSchema = new Schema({
  comment: { required: true, type: String },
  post: { ref: "Post", type: Types.ObjectId },
  user: { ref: "User", type: Types.ObjectId },
});

const schema = new Schema(
  {
    comments: {
      default: [],
      type: [commentSchema],
    },
    content: { required: true, type: String },
    creator: { ref: "User", type: Types.ObjectId },
    image: { type: String },
    likesUsers: [{ ref: "User", type: Types.ObjectId }],
    numberOfComments: { default: 0, type: Number },
    totalLikes: { default: 0, type: Number },
  },
  { timestamps: true },
);

// A document type combining IPost and Document interfaces
export interface IPostDocument extends mongoose.Document, IPost {}

// A model type combining IPostDocument and Model interfaces
export const PostModel = mongoose.model<IPostDocument>("Post", schema);
