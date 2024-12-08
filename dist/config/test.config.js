"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config = {
    env: "test",
    database: "mongodb://127.0.0.1:27017/neew-database",
    databaseName: "neew-database",
    frontUrl: "http://localhost:3000",
    googleKey: "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",
    googleClientId: "617862799460-erkfh2qvd432t4j1p0uqifpgc3pbmpe1.apps.googleusercontent.com",
    googleBackendRedirectUri: "http://localhost:9001/auth/google/callback",
    googleFrontendRedirectUri: "http://localhost:3000/onboarding/login",
    imageFolder: path_1.default.join(__dirname, "..", // src
    "..", // root
    "media"),
};
exports.default = config;
//# sourceMappingURL=test.config.js.map