"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const response_handler_1 = __importDefault(require("../utils/response-handler"));
// eslint-disable-next-line
const debug = (0, debug_1.default)("project:auth.mw");
async function authMw(req, res, next) {
    const token = req.header("x-auth-token") || req.header("Authorization");
    if (!token) {
        return response_handler_1.default.sendErrorResponse({
            res,
            code: appDefaults_constant_1.HTTP_CODES.UNAUTHORIZED,
            error: "Access denied. No token provided",
        });
    }
    try {
        jsonwebtoken_1.default.verify(token, "neew", (error, decoded) => {
            if (error) {
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.UNAUTHORIZED,
                    error: error.message,
                });
            }
            else {
                req.user = decoded;
                next();
            }
        });
    }
    catch (error) {
        return response_handler_1.default.sendErrorResponse({
            res,
            code: appDefaults_constant_1.HTTP_CODES.BAD_REQUEST,
            error: "Invalid Token",
        });
    }
}
exports.default = authMw;
//# sourceMappingURL=auth.mw.js.map