"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const response_handler_1 = __importDefault(require("../../utils/response-handler"));
const appDefaults_constant_1 = require("../../constants/appDefaults.constant");
const auth_mw_1 = __importDefault(require("../../middleware/auth.mw"));
const post_core_1 = __importDefault(require("../../core/post.core"));
const express_validator_2 = require("express-validator");
const mongoose_1 = require("mongoose");
const utils_1 = require("../../utils");
const debug = (0, debug_1.default)("project:post.service");
const create = [
    auth_mw_1.default,
    (0, express_validator_1.body)("content").isString().withMessage("Content must be a string"),
    (0, express_validator_1.body)("image").isString().withMessage("Image must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const newPost = await post_core_1.default.create({
                content: req.body.content,
                creator: new mongoose_1.Types.ObjectId(user.id),
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
    (0, express_validator_2.query)("perpage").isNumeric().withMessage("Perpage must be a number").optional(),
    (0, express_validator_2.query)("page").isNumeric().withMessage("Page must be a number").optional(),
    (0, express_validator_2.query)("dateFrom").isString().withMessage("DateFrom must be a string").optional(),
    (0, express_validator_2.query)("dateTo").isString().withMessage("DateTo must be a string").optional(),
    (0, express_validator_2.query)("period").isString().withMessage("Period must be a string").optional(),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const posts = await post_core_1.default.find(req, new mongoose_1.Types.ObjectId(user.id));
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Users fetched successfully",
                ...posts,
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
const getAll = [
    auth_mw_1.default,
    (0, express_validator_2.query)("perpage").isNumeric().withMessage("Perpage must be a number").optional(),
    (0, express_validator_2.query)("page").isNumeric().withMessage("Page must be a number").optional(),
    (0, express_validator_2.query)("dateFrom").isString().withMessage("DateFrom must be a string").optional(),
    (0, express_validator_2.query)("dateTo").isString().withMessage("DateTo must be a string").optional(),
    (0, express_validator_2.query)("period").isString().withMessage("Period must be a string").optional(),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const posts = await post_core_1.default.getAll(req);
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Users fetched successfully",
                ...posts,
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
    getAll,
};
//# sourceMappingURL=post.service.js.map