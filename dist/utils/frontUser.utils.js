"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = void 0;
const debug_1 = __importDefault(require("debug"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// eslint-disable-next-line
const debug = (0, debug_1.default)("project:frontUser.util");
function decodeToken(token) {
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
exports.decodeToken = decodeToken;
const frontUserUtil = {
    decodeToken,
};
exports.default = frontUserUtil;
//# sourceMappingURL=frontUser.utils.js.map