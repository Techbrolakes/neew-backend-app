"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDate = exports.timeUtil = exports.paginationUtil = exports.searchUtil = exports.generateToken = exports.throwIfUndefined = void 0;
const debug_1 = __importDefault(require("debug"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Objective: Implement utility functions for the application
function throwIfUndefined(x, name) {
    if (x === undefined) {
        throw new Error(`${name} must not be undefined`);
    }
    return x;
}
exports.throwIfUndefined = throwIfUndefined;
// =====================================================================================================
/** Generate and sign a user Token */
async function generateToken(data) {
    return new Promise((resolve, _reject) => {
        const signOptions = {};
        signOptions.expiresIn = "365d";
        jsonwebtoken_1.default.sign(data, "neew.@#KSJ1a@js", signOptions, (err, token) => {
            if (err) {
                (0, debug_1.default)(err.message);
            }
            resolve(token);
        });
    });
}
exports.generateToken = generateToken;
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