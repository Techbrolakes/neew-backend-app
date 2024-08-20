"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config = {
    env: "development",
    // database: "mongodb+srv://bdaiveed:neew2023@neewcluster.dzzdlnv.mongodb.net/?retryWrites=true&w=majority&appName=NeewCluster",
    database: "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/",
    databaseName: "neew-database",
    frontUrl: "https://neew-app.vercel.app",
    imageFolder: path_1.default.join(__dirname, "..", // src
    "..", // root
    "media"),
};
exports.default = config;
//# sourceMappingURL=development.config.js.map