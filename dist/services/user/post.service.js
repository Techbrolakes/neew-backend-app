"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const user_core_1 = __importDefault(require("../../core/user.core"));
const validator_mw_1 = require("../../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const response_handler_1 = __importDefault(require("../../utils/response-handler"));
const appDefaults_constant_1 = require("../../constants/appDefaults.constant");
const auth_mw_1 = __importDefault(require("../../middleware/auth.mw"));
const post_core_1 = __importDefault(require("../../core/post.core"));
const debug = (0, debug_1.default)("project:post.service");
const create = [
    auth_mw_1.default,
    (0, express_validator_1.body)("content").isString().withMessage("Content must be a string"),
    (0, express_validator_1.body)("image").isString().withMessage("Image must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const newPost = await post_core_1.default.create({
                content: req.body.content,
                creator: req.user._id,
                image: req.body.image,
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "Post created",
                data: newPost,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const list = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = await user_core_1.default.getByEmail(req.user.email);
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Users fetched successfully",
                data: user,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
exports.default = {
    list,
    create,
};
//# sourceMappingURL=post.service.js.map