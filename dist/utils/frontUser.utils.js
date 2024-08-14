"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// eslint-disable-next-line
const debug = (0, debug_1.default)("project:frontUser.util");
async function decodeToken(token) {
    const [provider, leftToken] = token.split(":");
    switch (provider) {
        case "local":
            return {
                provider: "local",
                payload: await decodeTokenLocal(leftToken),
            };
        case "googleTest":
            if (process.env.NODE_ENV === "test") {
                const payload = JSON.parse(Buffer.from(leftToken, "base64").toString("ascii"));
                return {
                    provider: "google",
                    payload,
                };
            }
            return undefined;
        case "google":
            return {
                provider: "google",
                payload: await decodeTokenGoogle(leftToken),
            };
        default:
            return undefined;
    }
}
function decodeTokenLocal(token) {
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
async function decodeTokenGoogle(token) {
    const secretKey = "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";
    const clientId = "354745730971-7m8stefuln9oa2ldlqscv2s9jrc766rf.apps.googleusercontent.com";
    const client = new google_auth_library_1.OAuth2Client(clientId, secretKey);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId,
    });
    const payload = ticket.getPayload();
    return payload;
}
exports.default = { decodeTokenGoogle, decodeToken };
//# sourceMappingURL=frontUser.utils.js.map