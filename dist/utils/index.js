"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDate = exports.timeUtil = exports.paginationUtil = exports.searchUtil = exports.generateRefreshToken = exports.generateToken = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.throwIfUndefined = exports.getCachedResponse = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const redisInit_1 = __importDefault(require("../init/redisInit"));
/**
 * @param {string} cacheKey - The Redis key to check.
 * @param {Response} res - Express response object.
 * @param {string} successMessage - Message to send on success.
 * @returns {Promise<any | null>} - Returns cached data if found, otherwise null.
 */
async function getCachedResponse(cacheKey, res, successMessage) {
    try {
        const cachedData = await redisInit_1.default.get(cacheKey);
        console.log("cachedData", cachedData);
        if (cachedData) {
            const result = JSON.parse(cachedData);
            response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: successMessage,
                data: result,
            });
            return result;
        }
        return null;
    }
    catch (error) {
        console.error(`Redis error for key ${cacheKey}:`, error.message);
        return null;
    }
}
exports.getCachedResponse = getCachedResponse;
// Objective: Implement utility functions for the application
function throwIfUndefined(x, name) {
    if (x === undefined) {
        throw new Error(`${name} must not be undefined`);
    }
    return x;
}
exports.throwIfUndefined = throwIfUndefined;
// =====================================================================================================
exports.ACCESS_TOKEN_SECRET = "neew.@#KSJ1a@js"; // Ideally from env vars
exports.REFRESH_TOKEN_SECRET = "refresh.@#KSJ1a@js"; // Different secret for refresh tokens
async function generateToken(data) {
    return new Promise((resolve, reject) => {
        const signOptions = {
            expiresIn: 30 * 60, // 30 minutes
        };
        jsonwebtoken_1.default.sign(data, exports.ACCESS_TOKEN_SECRET, signOptions, (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        });
    });
}
exports.generateToken = generateToken;
async function generateRefreshToken(data) {
    return new Promise((resolve, reject) => {
        const signOptions = {
            expiresIn: 24 * 60 * 60,
        };
        jsonwebtoken_1.default.sign(data, exports.REFRESH_TOKEN_SECRET, signOptions, (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        });
    });
}
exports.generateRefreshToken = generateRefreshToken;
function searchUtil({ search, searchArray }) {
    let searchQuery;
    if (search !== "undefined" && Object.keys(search).length > 0) {
        searchQuery = {
            $or: searchArray.map((item) => {
                return {
                    [item]: new RegExp(search, "i"),
                };
            }),
        };
    }
    return searchQuery;
}
exports.searchUtil = searchUtil;
const paginationUtil = ({ page, perpage, total }) => {
    return {
        hasPrevious: page > 1, // Check if there is a previous page
        prevPage: page - 1, // Get the previous page number
        hasNext: page < Math.ceil(total / perpage), // Check if there is a next page
        next: page + 1, // Get the next page number
        currentPage: Number(page), // Get the current page number
        total: total, // Get the total number of records
        pageSize: perpage, // Get the page size
        lastPage: Math.ceil(total / perpage),
    };
};
exports.paginationUtil = paginationUtil;
async function timeUtil({ period, dateFrom, dateTo }) {
    const myDateFrom = convertDate(dateFrom);
    const myDateTo = convertDate(dateTo);
    let timeFilter;
    const { start, end } = await getTodayTime(); // Get the start and end times for today
    const current_date = new Date(); // Get the current date
    if (period === "all" || "custom") {
        timeFilter = {
            createdAt: { $gte: new Date(myDateFrom), $lte: new Date(myDateTo) },
        };
    }
    else if (period === "today") {
        timeFilter = { createdAt: { $gte: start, $lte: end } };
    }
    else {
        const days = await subtractDays(Number(period.replace("days", "")));
        timeFilter = {
            createdAt: { $gte: new Date(days), $lte: new Date(current_date) },
        };
    }
    return timeFilter;
}
exports.timeUtil = timeUtil;
// =====================================================================================================
function convertDate(date) {
    return new Date(date).toISOString();
}
exports.convertDate = convertDate;
// =====================================================================================================
function getTodayTime() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
// =====================================================================================================
function subtractDays(days) {
    return new Date(new Date().setDate(new Date().getDate() - days));
}
//# sourceMappingURL=index.js.map