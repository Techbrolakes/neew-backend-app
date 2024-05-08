"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../models/post.model");
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
};
exports.default = PostCore;
//# sourceMappingURL=post.core.js.map