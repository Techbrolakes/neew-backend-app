"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    messages: [{ type: mongoose_1.default.Schema.ObjectId, ref: "Message" }],
    sender: { type: mongoose_1.default.Schema.ObjectId, required: true, ref: "User" },
    receiver: { type: mongoose_1.default.Schema.ObjectId, required: true, ref: "User" },
}, {
    timestamps: true,
});
exports.ConversationModel = mongoose_1.default.model("Conversation", schema);
//# sourceMappingURL=conversation.model.js.map