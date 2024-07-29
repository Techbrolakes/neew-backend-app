"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    email: { required: true, type: String, unique: true },
    firstName: { required: true, type: String },
    interest: {
        default: "general_interest",
        enum: ["general_interest", "entrepreneur", "social_progress", "investors", "eco_system_builder"],
        type: String,
    },
    lastName: { required: true, type: String },
    location: { required: true, type: String },
    password: { required: true, type: String },
    phone: { required: false, type: String },
}, { timestamps: true });
// A model type extending the mongoose Model interface
exports.WaitlistModel = mongoose_1.default.model("Waitlists", schema);
//# sourceMappingURL=waitlist.model.js.map