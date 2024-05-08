"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("../utils");
// get user by id
function getById({ _id }) {
    return user_model_1.UserModel.findOne({ _id }).lean();
}
// get user by email
function getByEmail(email) {
    return user_model_1.UserModel.findOne({ email }).lean();
}
// get by query
function getByQuery(query, select = "") {
    return user_model_1.UserModel.findOne(query).select(select).lean();
}
// atomic update
function atomicUpdate(userId, record, session = null) {
    return user_model_1.UserModel.findOneAndUpdate({ _id: userId }, { ...record }, { new: true, session });
}
// find all users
async function getAll(req) {
    const { query } = req;
    const search = String(query.search);
    const perpage = Number(query.perpage) || 10;
    const page = Number(query.page) || 1;
    const dateFrom = query.dateFrom || "Jan 1 2021";
    const dateTo = query.dateTo || `${Date()}`;
    const period = "all" || String(query.period); // Set the period for filtering
    const timeFilter = await (0, utils_1.timeUtil)({ period, dateFrom, dateTo });
    const searching = (0, utils_1.searchUtil)({
        search: search,
        searchArray: ["firstName", , "lastName", "email"],
    });
    const filter = { ...searching, ...timeFilter };
    // Get the plan documents from the database
    const users = await user_model_1.UserModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(perpage)
        .skip(page * perpage - perpage);
    const total = await user_model_1.UserModel.countDocuments(filter);
    return Promise.resolve({
        data: users,
        pagination: {
            hasPrevious: page > 1, // Check if there is a previous page
            prevPage: page - 1, // Get the previous page number
            hasNext: page < Math.ceil(total / perpage), // Check if there is a next page
            next: page + 1, // Get the next page number
            currentPage: Number(page), // Get the current page number
            total: total, // Get the total number of records
            pageSize: perpage, // Get the page size
            lastPage: Math.ceil(total / perpage),
        },
    });
}
async function create({ email, firstName, interest, lastName, location, password, telephone, website, communityImpact, foundingYear, industry, locationOfRegistration, networkWants, operatingAddress, photo, revenue, sdgImpact, traction, productMaturity, growthTrend, exitFounder, exitStrategy, exitTimeFrame, exitMethod, forecastedEbitda, founderValuation, founderValuationLogic, companyName, companyLogo, ebitda, usp, }) {
    const data = {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim().toLocaleLowerCase(),
        interest,
        lastName: lastName.trim().toLocaleLowerCase(),
        location,
        password,
        telephone,
        website,
        communityImpact,
        foundingYear,
        industry,
        locationOfRegistration,
        networkWants,
        operatingAddress,
        photo,
        revenue,
        sdgImpact,
        traction,
        productMaturity,
        growthTrend,
        exitFounder,
        exitStrategy,
        exitTimeFrame,
        exitMethod,
        forecastedEbitda,
        founderValuation,
        founderValuationLogic,
        companyName,
        companyLogo,
        ebitda,
        usp,
    };
    // If password is provided, generate salt and hash it
    if (password) {
        const salt = bcrypt_1.default.genSaltSync(10);
        data.password = bcrypt_1.default.hashSync(password, salt);
    }
    // Create a new user with the given data
    const user = new user_model_1.UserModel(data);
    // Save the user to the database
    return await user_model_1.UserModel.create(user);
}
const UserCore = {
    create,
    getById,
    getByEmail,
    getByQuery,
    atomicUpdate,
    getAll,
};
exports.default = UserCore;
//# sourceMappingURL=user.core.js.map