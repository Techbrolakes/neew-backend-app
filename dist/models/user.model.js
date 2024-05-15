"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    communityImpact: { required: false, type: String },
    companyLogo: { required: false, type: String },
    companyName: { required: false, type: String },
    ebitda: { required: false, type: String },
    email: { required: true, type: String, unique: true },
    exitFounder: { required: false, type: String },
    exitMethod: { required: false, type: String },
    exitStrategy: { required: false, type: String },
    exitTimeframe: { required: false, type: String },
    firstName: { required: true, type: String },
    forecastedEbitda: { required: false, type: String },
    founderValuation: { required: false, type: String },
    founderValuationLogic: { required: false, type: String },
    foundingDate: { required: false, type: Date },
    growthTrend: { required: false, type: String },
    industry: { required: false, type: String },
    interest: {
        default: "general_public",
        enum: [
            "general_interest",
            "entrepreneur",
            "social_progress",
            "investors",
            "eco_system_builder",
            "general_public",
            "champions",
        ],
        type: String,
    },
    lastName: { required: true, type: String },
    location: { required: true, type: String },
    locationOfRegistration: { required: false, type: String },
    networkWants: { required: false, type: String },
    operatingAddress: { required: false, type: String },
    password: { required: true, type: String },
    photo: { required: false, type: String },
    productMaturity: { required: false, type: String },
    revenue: { required: false, type: String },
    sdgImpact: { required: false, type: String },
    telephone: { required: false, type: String },
    traction: { required: false, type: String },
    usp: { required: false, type: String },
    website: { required: false, type: String },
}, { timestamps: true });
// A model type extending the mongoose Model interface
exports.UserModel = mongoose_1.default.model("Users", UserSchema);
//# sourceMappingURL=user.model.js.map