"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const user_model_1 = require("../models/user.model");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const debug = (0, debug_1.default)("project:user.service");
const getAllUsers = [
    auth_mw_1.default,
    (0, express_validator_1.query)("page").optional().isNumeric().withMessage("Page must be a number"),
    (0, express_validator_1.query)("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const { page, perpage } = req.query;
            const users = await user_model_1.UserModel.find()
                .select("-password")
                .lean(true)
                .sort({ createdAt: -1 })
                .limit(perpage)
                .skip(page * perpage - perpage);
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Users fetched",
                data: users,
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
const getEntreprenuers = [
    auth_mw_1.default,
    (0, express_validator_1.query)("page").optional().isNumeric().withMessage("Page must be a number"),
    (0, express_validator_1.query)("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
    (0, express_validator_1.query)("locations").optional().isString().withMessage("Locations must be a string"),
    (0, express_validator_1.query)("industries").optional().isString().withMessage("Industries must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const { locations, industries, page, perpage } = req.query;
            // Extract query parameters for location and industry as arrays
            const filter = {
                companyLogo: { $exists: true, $ne: null },
                companyName: { $exists: true, $ne: null },
                interest: "entrepreneur",
                revenue: { $exists: true, $ne: null },
            };
            if (locations) {
                const locationsArray = locations.split(",").map((location) => location.trim());
                const locationRegex = locationsArray.map((location) => `(?=.*${location})`).join("");
                filter.location = { $regex: new RegExp(locationRegex, "i") };
            }
            if (industries) {
                const industriesArray = industries.split(",").map((industry) => industry.trim());
                filter.industry = { $in: industriesArray };
            }
            const [entrepreneurs, total] = await Promise.all([
                user_model_1.UserModel.find(filter)
                    .select("-password")
                    .lean(true)
                    .sort({ createdAt: -1 })
                    .limit(perpage)
                    .skip(page * perpage - perpage),
                user_model_1.UserModel.aggregate([{ $match: filter }, { $count: "count" }]),
            ]);
            const pagination = (0, utils_1.paginationUtil)({ page, perpage, total: total[0]?.count });
            if (entrepreneurs.length === 0) {
                return response_handler_1.default.sendSuccessResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.OK,
                    message: "No entreprenuers found",
                    data: [],
                });
            }
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Entreprenuers fetched",
                data: entrepreneurs,
                pagination,
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
    getEntreprenuers,
    getAllUsers,
};
//# sourceMappingURL=user.service.js.map