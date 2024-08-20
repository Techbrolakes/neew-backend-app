"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const newletter_model_1 = require("../models/newletter.model");
const debug = (0, debug_1.default)("project:newsletter.service");
const subscribe = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email must be a valid email"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const email = await newletter_model_1.NewletterModel.findOne({ email: req.body.email });
            if (email) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.BAD_REQUEST,
                    error: "Email already subscribed",
                });
            }
            await newletter_model_1.NewletterModel.create({
                email: req.body.email,
            });
            response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Subscribed",
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
const unsubscribe = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email must be a valid email"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const email = await newletter_model_1.NewletterModel.findOne({ email: req.body.email });
            if (!email) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.BAD_REQUEST,
                    error: "Email not subscribed",
                });
            }
            await newletter_model_1.NewletterModel.deleteOne({ email: req.body.email });
            response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Unsubscribed",
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
const get = [
    async (req, res) => {
        try {
            const emails = await newletter_model_1.NewletterModel.find();
            response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                data: emails,
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
    subscribe,
    get,
    unsubscribe,
};
//# sourceMappingURL=newsletter.service.js.map