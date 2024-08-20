import mongoose from "mongoose";

export interface INewletter {
  email: string;
}

const schema = new mongoose.Schema(
  {
    email: { type: String },
  },
  {
    timestamps: true,
  },
);

export interface INewletterDocument extends mongoose.Document, INewletter {}

export const NewletterModel = mongoose.model<INewletterDocument>("Newletter", schema);
