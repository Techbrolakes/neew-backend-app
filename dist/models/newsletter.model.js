"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    email: { type: String },
}, {
    timestamps: true,
});
exports.NewsletterModel = mongoose_1.default.model("Newsletter", schema);
//# sourceMappingURL=newsletter.model.js.map