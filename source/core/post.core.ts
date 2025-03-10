import { PostModel } from "../models/post.model";
import { UserModel } from "../models/user.model";
import { NotificationModel } from "../models/notification.model";
import { IPostDocument } from "../models/post.model";
import { FilterQuery, Types } from "mongoose";
import express from "express";
import { paginationUtil } from "../utils";

// Function to get post likes by post ID
async function getLikesUsers(postId: Types.ObjectId): Promise<IPostDocument | any | null> {
  const post = await PostModel.findById(postId);

  if (post) {
    const users = await UserModel.find({ _id: { $in: post.likesUsers } }).select("firstName lastName photo interest  -_id");

    return users;
  }
}

// Function to like a post
type LikePost = {
  postId: Types.ObjectId;
  userId: Types.ObjectId | any;
};

async function likePost({ postId, userId }: LikePost): Promise<IPostDocument | null> {
  const post = await PostModel.findById(postId);

  const index = post.likesUsers.indexOf(userId);

  if (index !== -1) {
    post.likesUsers.splice(index, 1); // Remove user ID from likesUsers array
    post.totalLikes -= 1;
  } else {
    post.likesUsers.push(userId);
    post.totalLikes += 1;

    // Add notification
    await NotificationModel.create({
      message: `New like on your post`,
      notificationType: "like",
      postId: post._id,
      userId: post.creator,
    });
  }

  return post.save();
}

// Function to delete a post
async function deletePost(postId: Types.ObjectId): Promise<IPostDocument | null | any> {
  return PostModel.findByIdAndDelete({ _id: postId });
}

// Function to edit a post
type EditPost = {
  postId: Types.ObjectId;
  content: string;
  image: string;
  mentions?: Types.ObjectId[] | any;
};

async function edit({ postId, content, image, mentions }: EditPost): Promise<IPostDocument | null> {
  const post = await PostModel.findById(postId);

  post.content = content;
  post.image = image;
  post.mentions = mentions;

  return await post.save();
}

// Function to addComment to a post
type AddComment = {
  postId: Types.ObjectId;
  comment: string;
  userId: Types.ObjectId;
  mentions?: Types.ObjectId[];
};

async function addComment({ postId, comment, userId, mentions }: AddComment): Promise<IPostDocument | null> {
  const post = await PostModel.findById(postId);

  const newComment = {
    comment,
    user: userId,
    post: postId,
    mentions,
  };

  if (newComment) {
    await NotificationModel.create({
      message: `New comment on your post`,
      notificationType: "comment",
      userId: post.creator,
    });
  }

  post.comments.push(newComment);

  if (newComment) {
    await NotificationModel.create({
      message: `New comment on your post`,
      notificationType: "comment",
      postId: post._id,
      userId: post.creator,
    });
  }

  // increment the number of comments
  post.numberOfComments = post.numberOfComments + 1;

  // Save the updated post
  const savePost = await post.save();

  return savePost;
}

// Function to get a post by id
async function getPostById(postId: Types.ObjectId): Promise<IPostDocument | null> {
  return PostModel.findById(postId)
    .populate("creator")
    .populate("comments.post", "content totalLikes numberOfComments")
    .populate("comments.user", "firstName lastName photo")
    .populate("comments.replies.user", "firstName lastName photo")
    .lean();
}

async function getAllPosts(req: express.Request): Promise<any> {
  const { query } = req;
  const perpage = Number(query.perpage) || 200;
  const page = Number(query.page) || 1;

  // Generate a unique cache key based on pagination
  const cacheKey = `allPosts:page:${page}:perpage:${perpage}`;

  try {
    const [posts, total] = await Promise.all([
      PostModel.find()
        .sort({ createdAt: -1 })
        .populate("creator", "firstName lastName photo persona")
        .populate("mentions", "firstName lastName")
        .limit(perpage)
        .skip(page * perpage - perpage)
        .lean(),

      PostModel.countDocuments(),
    ]);

    const pagination = await paginationUtil({ total, page, perpage });

    const result = {
      data: posts,
      pagination,
    };

    return result;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Unable to fetch posts");
  }
}

// Function that lists all user posts
async function find(req: express.Request, userId: Types.ObjectId): Promise<IPostDocument[] | null | any> {
  const { query } = req; // Get the query params from the request object
  const perpage = Number(query.perpage) || 10; // Set the number of records to return
  const page = Number(query.page) || 1; // Set the page number

  const [posts, total] = await Promise.all([
    PostModel.find({
      creator: userId,
    })
      .sort({ createdAt: -1 })
      .populate("creator", "firstName lastName photo persona")
      .populate("mentions", "firstName lastName")
      .limit(perpage)
      .skip(page * perpage - perpage)
      .lean(),

    PostModel.countDocuments({
      creator: userId,
    }),
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
  mentions?: Types.ObjectId[];
};

async function create({ content, creator, image, mentions }: CreatePost): Promise<IPostDocument> {
  const post = {
    content,
    creator,
    image,
    mentions,
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
  getAllPosts,
  getPostById,
  addComment,
  edit,
  deletePost,
  likePost,
  getLikesUsers,
};

export default PostCore;
