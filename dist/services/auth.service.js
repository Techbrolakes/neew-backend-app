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
const debug = (0, debug_1.default)("project:user.service");
const login = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("password").isString().exists().withMessage("Invalid password"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const user = await user_core_1.default.getByEmail(req.body.email);
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
    (0, express_validator_1.body)("interest").isString().withMessage("Invalid interest"),
    (0, express_validator_1.body)("location").isString().withMessage("Invalid location"),
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
                lastName: req.body.lastName,
                location: req.body.location,
                password: req.body.password,
                telephone: req.body.telephone,
            });
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.CREATED,
                message: "User created",
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
exports.default = {
    register,
    login,
    resetPassword,
};
//# sourceMappingURL=auth.service.js.map