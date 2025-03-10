"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const user_core_1 = __importDefault(require("../core/user.core"));
const validator_mw_1 = require("../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("../utils");
const user_model_1 = require("../models/user.model");
const frontUser_utils_1 = __importDefault(require("../utils/frontUser.utils"));
const debug = (0, debug_1.default)("project:user.service");
const login = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("password").isString().exists().withMessage("Invalid password"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = await user_core_1.default.getByEmail(req.body.email);
            if (!user?.password && user?.provider === user_model_1.AuthProvider.google) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "User registered with Google. Please login with Google",
                });
            }
            if (!user) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: "User does not exist",
                });
            }
            // Compare the passwords
            const result = bcrypt_1.default.compareSync(req.body.password, user?.password);
            if (!result) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.BAD_REQUEST,
                    error: "Invalid Password! Please input the correct one.",
                });
            }
            const token = await (0, utils_1.generateToken)({
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
            const refreshToken = await (0, utils_1.generateRefreshToken)({
                id: user._id,
                email: user.email,
            });
            await user_model_1.UserModel.findOneAndUpdate({ email: req.body.email }, { $set: { refreshToken } }, { new: true });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Login successful",
                data: { ...user, token, refreshToken },
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
const register = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("firstName").isString().withMessage("Invalid first name"),
    (0, express_validator_1.body)("lastName").isString().withMessage("Invalid last name"),
    (0, express_validator_1.body)("password").isString().withMessage("Invalid password"),
    (0, express_validator_1.body)("interest").isArray().withMessage("Invalid interest"),
    (0, express_validator_1.body)("location").isString().withMessage("Invalid location"),
    (0, express_validator_1.body)("industry").isArray().withMessage("Invalid industry"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const existingUser = await user_core_1.default.getByEmail(req.body.email);
            if (existingUser) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.CONFLICT,
                    error: "This email is already taken",
                });
            }
            const user = await user_core_1.default.create({
                email: req.body.email,
                firstName: req.body.firstName,
                interest: req.body.interest,
                industry: req.body.industry,
                lastName: req.body.lastName,
                location: req.body.location,
                password: req.body.password,
                telephone: req.body.telephone,
                provider: user_model_1.AuthProvider.local,
                provider_id: req.body.email,
            });
            const token = await (0, utils_1.generateToken)({
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userId: user._id,
            });
            const refreshToken = await (0, utils_1.generateRefreshToken)({
                id: user._id,
                email: user.email,
            });
            await user_model_1.UserModel.findOneAndUpdate({ email: req.body.email }, { $set: { refreshToken } }, { new: true });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "User created",
                data: { user, token, refreshToken },
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
const resetPassword = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("password").isString().exists().withMessage("Invalid password"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const existingUser = await user_core_1.default.getByEmail(req.body.email);
            if (existingUser) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.CONFLICT,
                    error: "This email is already taken",
                });
            }
            if (!existingUser) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.NOT_FOUND,
                    error: `User with email ${req.body.email} does not exist`,
                });
            }
            //  Hash the password
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(req.body.password, salt);
            await user_model_1.UserModel.findOneAndUpdate({ email: req.data.email }, { password: hashedPassword });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Password reset successful",
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
const checkEmail = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = await user_core_1.default.getByEmail(req.body.email);
            if (user) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.CONFLICT,
                    error: "This email is already taken",
                });
            }
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "Success",
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
const refreshToken = [
    (0, express_validator_1.body)("refreshToken").isString().withMessage("Refresh token is required"),
    (0, express_validator_1.body)("accessToken").isString().withMessage("Access token is required"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const { refreshToken, accessToken } = req.body;
            // Decode the refresh token
            const decodedRefreshToken = await frontUser_utils_1.default.decodeRefreshToken(refreshToken);
            // Find user by ID
            const user = await user_model_1.UserModel.findById(decodedRefreshToken.id);
            if (!user) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.UNAUTHORIZED,
                    error: "Invalid refresh token",
                });
            }
            // Check if refresh tokens match
            if (user.refreshToken !== refreshToken) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.UNAUTHORIZED,
                    error: "Invalid refresh token",
                });
            }
            // Decode the access token
            const decodedAccessToken = await frontUser_utils_1.default.decodeAccessToken(accessToken);
            let newAccessToken = accessToken;
            let newRefreshToken = refreshToken;
            // Check if access token has expired
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            if (decodedAccessToken.exp < currentTime) {
                // Generate a new access token if expired
                newAccessToken = await (0, utils_1.generateToken)({
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                });
            }
            // Check if refresh token has expired
            if (decodedRefreshToken.exp < currentTime) {
                // Generate a new refresh token if expired
                newRefreshToken = await (0, utils_1.generateRefreshToken)({
                    id: user._id,
                    email: user.email,
                });
                user.refreshToken = newRefreshToken; // Rotate the refresh token
                await user.save();
            }
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Token refreshed",
                data: {
                    token: newAccessToken,
                    refreshToken: newRefreshToken,
                },
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.UNAUTHORIZED,
                error: "Invalid or expired tokens",
            });
        }
    },
];
exports.default = {
    register,
    login,
    resetPassword,
    checkEmail,
    refreshToken,
};
//# sourceMappingURL=auth.service.js.map