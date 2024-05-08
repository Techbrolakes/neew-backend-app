"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../models/post.model");
const utils_1 = require("../utils");
async function getAll(req) {
    const { query } = req;
    const perpage = Number(query.perpage) || 10; // Set the number of records to return
    const page = Number(query.page) || 1; // Set the page number
    const dateFrom = query.dateFrom || "Jan 1 2020"; // Set the dateFrom
    const dateTo = query.dateTo || `${Date()}`; // Set the dateTo
    const period = String(query.period) || "all"; // Set the period
    // Check the period and set the time filter accordingly
    const timeFilter = await (0, utils_1.timeUtil)({ period, dateFrom, dateTo });
    const filterQuery = {
        ...timeFilter,
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
// Function that lists all user posts
async function find(req, userId) {
    const { query } = req; // Get the query params from the request object
    const perpage = Number(query.perpage) || 10; // Set the number of records to return
    const page = Number(query.page) || 1; // Set the page number
    const dateFrom = query.dateFrom || "Jan 1 2020"; // Set the dateFrom
    const dateTo = query.dateTo || `${Date()}`; // Set the dateTo
    const period = String(query.period) || "all"; // Set the period
    // Check the period and set the time filter accordingly
    const timeFilter = await (0, utils_1.timeUtil)({ period, dateFrom, dateTo });
    const filterQuery = {
        ...timeFilter,
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
    getAll,
};
exports.default = PostCore;
//# sourceMappingURL=post.core.js.map