"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../models/post.model");
const user_model_1 = require("../models/user.model");
const notification_model_1 = require("../models/notification.model");
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
        // Add notification
        await notification_model_1.NotificationModel.create({
            message: `New like on your post`,
            notificationType: "like",
            postId: post._id,
            userId,
        });
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
async function addComment({ postId, comment, userId, mentions }) {
    const post = await post_model_1.PostModel.findById(postId);
    const newComment = {
        comment,
        user: userId,
        post: postId,
        mentions,
    };
    if (newComment) {
        await notification_model_1.NotificationModel.create({
            message: `New comment on your post`,
            notificationType: "comment",
            userId,
        });
    }
    post.comments.push(newComment);
    if (newComment) {
        await notification_model_1.NotificationModel.create({
            message: `New comment on your post`,
            notificationType: "comment",
            postId: post._id,
            userId,
        });
    }
    // increment the number of comments
    post.numberOfComments = post.numberOfComments + 1;
    // Save the updated post
    const savePost = await post.save();
    return savePost;
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
    const [posts, total] = await Promise.all([
        post_model_1.PostModel.find({
            creator: userId,
        })
            .sort({ createdAt: -1 })
            .populate("creator", "firstName lastName photo persona")
            .populate("mentions", "firstName lastName")
            .limit(perpage)
            .skip(page * perpage - perpage)
            .lean(),
        post_model_1.PostModel.countDocuments({
            creator: userId,
        }),
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