import mongoose, { Schema } from "mongoose";

export interface IPost {
  content: string;
  image?: string;
  creator: string | any;
  totalLikes: number;
  likesUsers: string[];
  comments: any[];
  numberOfComments: any;
  mentions?: string[];
}

const commentSchema = new Schema({
  comment: { required: true, type: String },
  mentions: [{ ref: "User", type: mongoose.Types.ObjectId }],
  post: { ref: "Post", type: mongoose.Types.ObjectId },
  replies: [
    {
      reply: { required: true, type: String },
      user: { ref: "User", type: mongoose.Types.ObjectId },
    },
  ],
  user: { ref: "User", type: mongoose.Types.ObjectId },
});

const schema: Schema = new Schema(
  {
    comments: {
      default: [],
      type: [commentSchema],
    },
    content: { required: true, type: String },
    creator: { ref: "User", type: mongoose.Types.ObjectId },
    image: { type: String },
    likesUsers: [{ ref: "User", type: mongoose.Types.ObjectId }],
    mentions: [{ ref: "User", type: mongoose.Types.ObjectId }],
    numberOfComments: { default: 0, type: Number },
    totalLikes: { default: 0, type: Number },
  },
  { timestamps: true },
);

// A document type combining IPost and Document interfaces
export interface IPostDocument extends mongoose.Document, IPost {}

// A model type combining IPostDocument and Model interfaces
export const PostModel = mongoose.model<IPostDocument>("Post", schema);
