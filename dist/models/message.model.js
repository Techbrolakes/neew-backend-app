"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    conversationId: { ref: "Conversation", type: mongoose_1.default.Types.ObjectId },
    image: { required: false, type: String },
    senderId: { ref: "User", type: mongoose_1.default.Types.ObjectId },
    status: { default: "delivered", enum: ["delivered", "seen"], type: String },
    text: { required: false, type: String },
}, {
    timestamps: true,
});
// A model type combining IMessageDocument and Model interfaces
exports.MessageModel = mongoose_1.default.model("Message", schema);
//# sourceMappingURL=message.model.js.map