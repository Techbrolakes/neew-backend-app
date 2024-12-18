"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default({
    host: "127.0.0.1", // Redis host
    port: 6379, // Redis port
});
exports.CACHE_TTL = 3600; // Cache expiry time in seconds (1 hour)
exports.default = redis;
//# sourceMappingURL=redisInit.js.map