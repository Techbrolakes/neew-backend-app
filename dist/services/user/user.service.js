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
const debug = (0, debug_1.default)("neew:user.service");
const register = [
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("firstName").isString(),
    (0, express_validator_1.body)("lastName").isString(),
    (0, express_validator_1.body)("password").isString(),
    (0, express_validator_1.body)("interest").isString(),
    (0, express_validator_1.body)("location").isString(),
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
                website: req.body.website,
                communityImpact: req.body.communityImpact,
                foundingYear: req.body.foundingYear,
                industry: req.body.industry,
                locationOfRegistration: req.body.locationOfRegistration,
                networkWants: req.body.networkWants,
                operatingAddress: req.body.operatingAddress,
                photo: req.body.photo,
                revenue: req.body.revenue,
                sdgImpact: req.body.sdgImpact,
                traction: req.body.traction,
                productMaturity: req.body.productMaturity,
                growthTrend: req.body.growthTrend,
                exitFounder: req.body.exitFounder,
                exitStrategy: req.body.exitStrategy,
                exitTimeFrame: req.body.exitTimeFrame,
                exitMethod: req.body.exitMethod,
                forecastedEbitda: req.body.forecastedEbitda,
                founderValuation: req.body.founderValuation,
                founderValuationLogic: req.body.founderValuationLogic,
                companyName: req.body.companyName,
                companyLogo: req.body.companyLogo,
                ebitda: req.body.ebitda,
                usp: req.body.usp,
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
exports.default = {
    register,
};
//# sourceMappingURL=user.service.js.map