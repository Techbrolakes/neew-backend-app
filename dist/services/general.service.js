"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const express_validator_1 = require("express-validator");
const link_preview_js_1 = require("link-preview-js");
const redisInit_1 = __importStar(require("../init/redisInit"));
const debug = (0, debug_1.default)("project:general.service");
const linkPreview = [
    (0, express_validator_1.body)("url").isURL().withMessage("Invalid URL").notEmpty().withMessage("URL is required"),
    async (req, res) => {
        try {
            const { url } = req.body;
            if (!url) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.BAD_REQUEST,
                    error: "URL is required",
                });
            }
            const cachedData = await redisInit_1.default.get(url);
            if (cachedData) {
                return response_handler_1.default.sendSuccessResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.OK,
                    data: JSON.parse(cachedData),
                });
            }
            // Step 2: Fetch Metadata Using link-preview-js
            const metadata = await (0, link_preview_js_1.getLinkPreview)(url);
            // Step 3: Store Metadata in Redis Cache with TTL
            await redisInit_1.default.setex(url, redisInit_1.CACHE_TTL, JSON.stringify(metadata));
            // Step 4: Send Response
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                data: metadata,
            });
        }
        catch (error) {
            debug(`Error fetching metadata: ${error.message}`);
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: "Failed to fetch metadata for the provided URL.",
            });
        }
    },
];
exports.default = {
    linkPreview,
};
//# sourceMappingURL=general.service.js.map