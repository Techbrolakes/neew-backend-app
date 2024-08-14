"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const express_validator_1 = require("express-validator");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const utils_1 = require("../utils");
const user_model_1 = require("../models/user.model");
const debug = (0, debug_1.default)("project:profile.service");
const update = [
    auth_mw_1.default,
    (0, express_validator_1.body)("email").isEmail().optional().withMessage("Invalid email"),
    (0, express_validator_1.body)("firstName").isString().optional().withMessage("Invalid first name"),
    (0, express_validator_1.body)("lastName").isString().optional(),
    (0, express_validator_1.body)("interest").isString().optional(),
    (0, express_validator_1.body)("location").isString().optional(),
    (0, express_validator_1.body)("communityImpact").isString().optional(),
    (0, express_validator_1.body)("companyName").isString().optional(),
    (0, express_validator_1.body)("companyLogo").isString().optional(),
    (0, express_validator_1.body)("ebitda").isString().optional(),
    (0, express_validator_1.body)("exitFounder").isString().optional(),
    (0, express_validator_1.body)("exitMethod").isString().optional(),
    (0, express_validator_1.body)("exitStrategy").isString().optional(),
    (0, express_validator_1.body)("exitTimeFrame").isString().optional(),
    (0, express_validator_1.body)("forecastedEbitda").isString().optional(),
    (0, express_validator_1.body)("founderValuation").isString().optional(),
    (0, express_validator_1.body)("founderValuationLogic").isString().optional(),
    (0, express_validator_1.body)("foundingYear").isString().optional(),
    (0, express_validator_1.body)("growthTrend").isString().optional(),
    (0, express_validator_1.body)("industry").isString().optional(),
    (0, express_validator_1.body)("locationOfRegistration").isString().optional(),
    (0, express_validator_1.body)("networkWants").isString().optional(),
    (0, express_validator_1.body)("operatingAddress").isString().optional(),
    (0, express_validator_1.body)("photo").isString().optional(),
    (0, express_validator_1.body)("revenue").isString().optional(),
    (0, express_validator_1.body)("sdgImpact").isString().optional(),
    (0, express_validator_1.body)("traction").isString().optional(),
    (0, express_validator_1.body)("productMaturity").isString().optional(),
    (0, express_validator_1.body)("exitFounder").isString().optional(),
    (0, express_validator_1.body)("exitStrategy").isString().optional(),
    (0, express_validator_1.body)("exitTimeFrame").isString().optional(),
    (0, express_validator_1.body)("exitMethod").isString().optional(),
    (0, express_validator_1.body)("founderValuation").isString().optional(),
    (0, express_validator_1.body)("founderValuationLogic").isString().optional(),
    (0, express_validator_1.body)("companyName").isString().optional(),
    (0, express_validator_1.body)("companyLogo").isString().optional(),
    (0, express_validator_1.body)("ebitda").isString().optional(),
    (0, express_validator_1.body)("usp").isString().optional(),
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
            console.log('user', user);
            const currentUser = await user_model_1.UserModel.findById(user.id).select("-password").lean(true);
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "User fetched successfully",
                data: currentUser,
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