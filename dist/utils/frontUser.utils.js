"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAccessToken = void 0;
const debug_1 = __importDefault(require("debug"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const _1 = require(".");
// eslint-disable-next-line
const debug = (0, debug_1.default)("project:frontUser.util");
const signToken = (payload, options) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, options);
};
const decodeAccessTokenWithoutValidation = (token) => {
    return jsonwebtoken_1.default.decode(token); // Decode without verification
};
function decodeAccessToken(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, "neew.@#KSJ1a@js", (error, decoded) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(decoded);
        });
    });
}
exports.decodeAccessToken = decodeAccessToken;
function decodeRefreshToken(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, _1.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err)
                return reject(err);
            resolve(decoded);
        });
    });
}
const frontUserUtil = {
    decodeAccessToken,
    decodeRefreshToken,
    signToken,
    decodeAccessTokenWithoutValidation,
};
exports.default = frontUserUtil;
//# sourceMappingURL=frontUser.utils.js.map