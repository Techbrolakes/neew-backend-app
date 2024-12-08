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
const google_auth_library_1 = require("google-auth-library");
const debug = (0, debug_1.default)("project:user.service");
const secretKey = "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";
const clientId = "617862799460-erkfh2qvd432t4j1p0uqifpgc3pbmpe1.apps.googleusercontent.com";
const oauth2Client = new google_auth_library_1.OAuth2Client(clientId, secretKey, "http://localhost:9001/api/auth/google/callback");
const generateGoogleAuthUrl = [
    async (req, res) => {
        try {
            const url = oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: ["profile", "email"],
                prompt: "select_account",
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Success",
                data: { authorizationUrl: url },
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
const googleCallback = [
    async (req, res) => {
        try {
            const code = req.query.code;
            // Exchange the authorization code for tokens
            const { tokens } = await oauth2Client.getToken(code);
            const accessToken = tokens.access_token;
            // Fetch user details from Google’s user info endpoint
            // Fetch user details from Google’s user info endpoint using Fetch API
            const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!userInfoResponse.ok) {
                throw new Error(`Failed to fetch user info: ${userInfoResponse.statusText}`);
            }
            const user = await userInfoResponse.json();
            console.log("user", user);
            console.log("tokens", tokens);
            console.log("tokens", tokens);
            res.redirect(`http://localhost:3000?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`);
            res.json({ message: "Google callback", tokens });
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
const login = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("password").isString().exists().withMessage("Invalid password"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = await user_core_1.default.getByEmail(req.body.email);
            if (!user?.password) {
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
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Login successful",
                data: { ...user, token },
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
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "User created",
                data: { user, token },
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
exports.default = {
    register,
    login,
    resetPassword,
    checkEmail,
    generateGoogleAuthUrl,
    googleCallback,
};
//# sourceMappingURL=auth.service.js.map