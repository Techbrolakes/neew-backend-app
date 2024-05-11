"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../models/post.model");
const user_model_1 = require("../models/user.model");
const utils_1 = require("../utils");
// Function to get post likes by post ID
async function getLikesUsers(postId) {
    const post = await post_model_1.PostModel.findById(postId);
    if (post) {
        const users = await user_model_1.UserModel.find({ _id: { $in: post.likesUsers } }).select("firstName lastName photo interest  -_id");
        return users;
    }
}
async function likePost({ postId, userId }) {
    const post = await post_model_1.PostModel.findById(postId);
    const index = post.likesUsers.indexOf(userId);
    if (index !== -1) {
        post.likesUsers.splice(index, 1); // Remove user ID from likesUsers array
        post.totalLikes -= 1;
    }
    else {
        post.likesUsers.push(userId);
        post.totalLikes += 1;
    }
    return post.save();
}
// Function to delete a post
async function deletePost(postId) {
    return post_model_1.PostModel.findByIdAndDelete({ _id: postId });
}
async function edit({ postId, content, image }) {
    const post = await post_model_1.PostModel.findById(postId);
    post.content = content;
    post.image = image;
    return post.save();
}
async function addComment({ postId, comment, creator }) {
    const post = await post_model_1.PostModel.findById(postId);
    const newComment = {
        comment,
        user: creator,
    };
    post.comments.push(newComment);
    post.numberOfComments = post.comments.length;
    return post.save();
}
// Function to get a post by id
async function getPostById(postId) {
    return post_model_1.PostModel.findById(postId)
        .populate("creator")
        .populate("comments.post", "content totalLikes numberOfComments")
        .populate("comments.user", "firstName lastName photo")
        .lean();
}
async function getAllPosts(req) {
    const { query } = req;
    const perpage = Number(query.perpage) || 10;
    const page = Number(query.page) || 1;
    const [posts, total] = await Promise.all([
        post_model_1.PostModel.find()
            .sort({ createdAt: -1 })
            .populate({
            path: "creator",
            select: "name email image",
        })
            .limit(perpage)
            .skip(page * perpage - perpage)
            .lean(),
        post_model_1.PostModel.countDocuments(),
    ]);
    const pagination = await (0, utils_1.paginationUtil)({ total, page, perpage });
    return {
        data: posts,
        pagination,
    };
}
// Function that lists all user posts
async function find(req, userId) {
    const { query } = req; // Get the query params from the request object
    const perpage = Number(query.perpage) || 10; // Set the number of records to return
    const page = Number(query.page) || 1; // Set the page number
    const filterQuery = {
        creator: userId,
    };
    const [posts, total] = await Promise.all([
        post_model_1.PostModel.find(filterQuery)
            .sort({ createdAt: -1 })
            .populate({
            path: "creator",
            select: "name email image",
        })
            .limit(perpage)
            .skip(page * perpage - perpage)
            .lean(),
        post_model_1.PostModel.countDocuments(filterQuery),
    ]);
    const pagination = await (0, utils_1.paginationUtil)({ total, page, perpage });
    return {
        data: posts,
        pagination,
    };
}
async function create({ content, creator, image }) {
    const post = {
        content,
        creator,
        image,
    };
    return post_model_1.PostModel.create(post);
}
// Function to get post by based on a query
async function getOne(query) {
    return post_model_1.PostModel.findOne(query);
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
exports.default = PostCore;
//# sourceMappingURL=post.core.js.map