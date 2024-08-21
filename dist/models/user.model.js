"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.AuthProvider = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["local"] = "local";
    AuthProvider["google"] = "google";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
const UserSchema = new mongoose_1.default.Schema({
    communityImpact: { required: false, type: String },
    companyLogo: { required: false, type: String },
    companyName: { required: false, type: String },
    ebitda: { required: false, type: String },
    email: { lowercase: true, required: true, type: String, unique: true },
    exitFounder: { required: false, type: String },
    exitMethod: { required: false, type: String },
    exitStrategy: { required: false, type: String },
    exitTimeFrame: { required: false, type: String },
    firstName: { required: true, type: String },
    forecastedEbitda: { required: false, type: String },
    founderValuation: { required: false, type: String },
    founderValuationLogic: { required: false, type: String },
    foundingYear: { required: false, type: String },
    growthTrend: { required: false, type: String },
    industry: { required: false, type: [String] },
    interest: {
        default: "general_interest",
        enum: ["investor", "entrepreneur", "partner", "general_interest", "champion", "business_partner"],
        type: [String],
    },
    lastName: { required: true, type: String },
    location: { type: String },
    locationOfRegistration: { required: false, type: String },
    networkWants: { required: false, type: String },
    online: { default: false, type: Boolean },
    operatingAddress: { required: false, type: String },
    password: { type: String },
    persona: {
        enum: ["entrepreneur", "general_interest"],
        required: false,
        type: String,
    },
    photo: { required: false, type: String },
    productMaturity: { required: false, type: String },
    revenue: { required: false, type: String },
    sdgImpact: { default: [], type: [String] },
    telephone: { required: false, type: String },
    traction: { required: false, type: String },
    usp: { required: false, type: String },
    website: { required: false, type: String }, // Add this field
    provider: {
        type: String,
        enum: Object.values(AuthProvider),
        required: true,
    },
    provider_id: {
        type: String,
    },
}, { timestamps: true });
UserSchema.index({ email: 1 });
// A model type extending the mongoose Model interface
exports.UserModel = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=user.model.js.map