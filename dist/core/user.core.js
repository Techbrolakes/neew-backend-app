"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
function create(user) {
    return user_model_1.UserModel.create(user);
}
// get user by id
function getById({ _id }) {
    return user_model_1.UserModel.findOne({ _id }).lean();
}
// get user by email
function getByEmail(email) {
    return user_model_1.UserModel.findOne({ email }).lean();
}
// get by query
function getByQuery(query, select = "") {
    return user_model_1.UserModel.findOne(query).select(select).lean();
}
const UserCore = {
    create,
    getById,
    getByEmail,
    getByQuery,
};
exports.default = UserCore;
//# sourceMappingURL=user.core.js.map