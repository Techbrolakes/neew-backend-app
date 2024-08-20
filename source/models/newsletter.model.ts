import mongoose from "mongoose";

export interface INewsletter {
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

export interface INewsletterDocument extends mongoose.Document, INewsletter {}

export const NewsletterModel = mongoose.model<INewsletterDocument>("Newsletter", schema);
