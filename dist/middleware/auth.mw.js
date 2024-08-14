"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const user_model_1 = require("../models/user.model");
const frontUser_utils_1 = __importDefault(require("../utils/frontUser.utils"));
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
        const decoded = await frontUser_utils_1.default.decodeToken(token);
        const user = await getUser(decoded);
        if (!user) {
            res.status(401).json({ message: "invalidUser" });
            return;
        }
        req.user = { id: user._id };
        next();
    }
    catch (e) {
        console.error(e);
        res.status(401).json({ message: "invalidToken" });
    }
}
exports.default = authMw;
async function getUser(decoded) {
    switch (decoded.provider) {
        case "local":
            return await user_model_1.UserModel.findById(decoded.payload.id, ["_id"]).lean();
        case "google":
            return await getUserFromGoogleToken(decoded.payload);
        default:
            return undefined;
    }
}
async function getUserFromGoogleToken(payload) {
    const foundUser = await getUserFromExternal(user_model_1.AuthProvider.google, payload.sub);
    if (foundUser) {
        return foundUser;
    }
    return await user_model_1.UserModel.create({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        photo: payload.picture,
        provider: user_model_1.AuthProvider.google,
        provider_id: payload.sub,
    });
}
async function getUserFromExternal(provider, providerId) {
    return await user_model_1.UserModel.findOne({
        provider: provider.toString(),
        provider_id: providerId,
    }, ["_id"]).lean();
}
//# sourceMappingURL=auth.mw.js.map