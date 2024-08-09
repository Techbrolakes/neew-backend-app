"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CompanySchema = new mongoose_1.default.Schema({
    traction: { required: false, type: String },
    usp: { required: false, type: String },
    website: { required: false, type: String },
    productMaturity: { required: false, type: String },
    revenue: { required: false, type: String },
    sdgImpact: { default: [], type: [String] },
    operatingAddress: { required: false, type: String },
    communityImpact: { required: false, type: String },
    companyLogo: { required: false, type: String },
    companyName: { required: false, type: String },
    ebitda: { required: false, type: String },
    exitFounder: { required: false, type: String },
    exitMethod: { required: false, type: String },
    exitStrategy: { required: false, type: String },
    exitTimeFrame: { required: false, type: String },
    forecastedEbitda: { required: false, type: String },
    founderValuation: { required: false, type: String },
    founderValuationLogic: { required: false, type: String },
    foundingYear: { required: false, type: String },
    growthTrend: { required: false, type: String },
    locationOfRegistration: { required: false, type: String },
    networkWants: { required: false, type: String },
});
// A model type combining ICompanyDocument and Model interfaces
exports.CompanyModel = mongoose_1.default.model("Company", CompanySchema);
//# sourceMappingURL=company.model.js.map