import { IPost, PostModel } from "../models/post.model";
import { IPostDocument } from "../models/post.model";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import express from "express";
import { paginationUtil, searchUtil, timeUtil } from "../utils";

async function getAll(req: express.Request): Promise<IPostDocument[] | null | any> {
  const { query } = req;

  const perpage = Number(query.perpage) || 10; // Set the number of records to return
  const page = Number(query.page) || 1; // Set the page number
  const dateFrom: any = query.dateFrom || "Jan 1 2020"; // Set the dateFrom
  const dateTo: any = query.dateTo || `${Date()}`; // Set the dateTo
  const period = String(query.period) || "all"; // Set the period

  // Check the period and set the time filter accordingly
  const timeFilter = await timeUtil({ period, dateFrom, dateTo });

  const filterQuery: any = {
    ...timeFilter,
  };

  const [posts, total] = await Promise.all([
    PostModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        select: "name email image",
      })
      .limit(perpage)
      .skip(page * perpage - perpage)
      .lean(),

    PostModel.countDocuments(filterQuery),
  ]);

  const pagination = await paginationUtil({ total, page, perpage });

  return {
    data: posts,
    pagination,
  };
}

// Function that lists all user posts
async function find(req: express.Request, userId: Types.ObjectId): Promise<IPostDocument[] | null | any> {
  const { query } = req; // Get the query params from the request object
  const perpage = Number(query.perpage) || 10; // Set the number of records to return
  const page = Number(query.page) || 1; // Set the page number
  const dateFrom: any = query.dateFrom || "Jan 1 2020"; // Set the dateFrom
  const dateTo: any = query.dateTo || `${Date()}`; // Set the dateTo
  const period = String(query.period) || "all"; // Set the period

  // Check the period and set the time filter accordingly
  const timeFilter = await timeUtil({ period, dateFrom, dateTo });

  const filterQuery: any = {
    ...timeFilter,
    creator: userId,
  };

  const [posts, total] = await Promise.all([
    PostModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        select: "name email image",
      })
      .limit(perpage)
      .skip(page * perpage - perpage)
      .lean(),

    PostModel.countDocuments(filterQuery),
  ]);

  const pagination = await paginationUtil({ total, page, perpage });

  return {
    data: posts,
    pagination,
  };
}

// Function to create a post
type CreatePost = {
  content: string;
  creator: Types.ObjectId;
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
  find,
  getAll,
};

export default PostCore;
