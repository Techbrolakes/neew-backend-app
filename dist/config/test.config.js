"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config = {
    env: "test",
    database: "mongodb://127.0.0.1:27017/neew-database",
    // database: "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/",
    databaseName: "neew-database",
    frontUrl: "http://localhost:3000",
    imageFolder: path_1.default.join(__dirname, "..", // src
    "..", // root
    "media"),
};
exports.default = config;
//# sourceMappingURL=test.config.js.map