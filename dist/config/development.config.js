"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config = {
    env: "development",
    // database: "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/",
    database: "mongodb+srv://bdaiveed:neew2023@neewcluster.dzzdlnv.mongodb.net/?retryWrites=true&w=majority&appName=NeewCluster",
    databaseName: "neew-database",
    frontUrl: "https://neew.io",
    googleKey: "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",
    googleClientId: "617862799460-erkfh2qvd432t4j1p0uqifpgc3pbmpe1.apps.googleusercontent.com",
    googleBackendRedirectUri: "https://dev-server.neew.io/auth/google/callback",
    googleFrontendRedirectUri: "https://neew.io/onboarding/login",
    imageFolder: path_1.default.join(__dirname, "..", // src
    "..", // root
    "media"),
};
exports.default = config;
//# sourceMappingURL=development.config.js.map