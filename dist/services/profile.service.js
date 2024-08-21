"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const utils_1 = require("../utils");
const user_model_1 = require("../models/user.model");
const newsletter_model_1 = require("../models/newsletter.model");
const debug = (0, debug_1.default)("project:profile.service");
const update = [
    auth_mw_1.default,
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(user.id, req.body, { new: true });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "User updated",
                data: updatedUser,
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
const me = [
    auth_mw_1.default,
    async (req, res) => {
        try {
            const user = (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const currentUser = await user_model_1.UserModel.findById(user.id).select("-password").lean(true);
            const doesExitInNewsletter = await newsletter_model_1.NewsletterModel.findOne({ email: currentUser.email });
            const response = {
                ...currentUser,
                isSubscribed: !!doesExitInNewsletter,
            };
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "User fetched successfully",
                data: response,
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
    me,
    update,
};
//# sourceMappingURL=profile.service.js.map