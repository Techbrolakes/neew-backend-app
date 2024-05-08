import { IPost, PostModel } from "../models/post.model";
import { IPostDocument } from "../models/post.model";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import express from "express";
import { searchUtil, timeUtil } from "../utils";

// Function to create a post
type CreatePost = {
  content: string;
  creator: Types.ObjectId | string;
  image: string;
};

async function create({ content, creator, image }: CreatePost): Promise<IPostDocument> {
  const post = {
    content,
    creator,
    image,
  };

  return PostModel.create(post);
}

// Function to get post by based on a query
async function getOne(query: FilterQuery<IPostDocument>): Promise<IPostDocument | null> {
  return PostModel.findOne(query);
}

const PostCore = {
  getOne,
  create,
};

export default PostCore;
