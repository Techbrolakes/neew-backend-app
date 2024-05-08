"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_handler_1 = __importDefault(require("../util/response-handler"));
const env_config_1 = require("../config/env.config");
const app_defaults_constant_1 = require("../constants/app_defaults.constant");
/*
   auth function to verify the user authorization
   req: Express request type
   res: response
   next: a middleware function to call the next process
*/
const auth = (req, res, next) => {
    // Get token from header or Authorization
    const token = req.header('x-auth-token') || req.header('Authorization');
    if (!token) {
        // If Token not found, then return error with status code Unauthorized
        return response_handler_1.default.sendErrorResponse({
            res,
            code: app_defaults_constant_1.HTTP_CODES.UNAUTHORIZED,
            error: 'Access denied. No token provided',
        });
    }
    try {
        // verify the token using the configs
        jsonwebtoken_1.default.verify(token, `${env_config_1.SERVER_TOKEN_SECRET}`, (error, decoded) => {
            if (error) {
                // Send error message if token cannot be verified
                return response_handler_1.default.sendErrorResponse({
                    res,
                    code: app_defaults_constant_1.HTTP_CODES.UNAUTHORIZED,
                    error: error.message,
                });
            }
            else {
                // Set the user data in the Express request object
                req.user = decoded;
                // Call the next process
                next();
            }
        });
    }
    catch (ex) {
        // Return Bad Request when something went wrong while verifying token
        return response_handler_1.default.sendErrorResponse({
            res,
            code: app_defaults_constant_1.HTTP_CODES.BAD_REQUEST,
            error: 'Invalid Token',
        });
    }
};
exports.default = {
    auth,
};
//# sourceMappingURL=auth.middleware.js.map