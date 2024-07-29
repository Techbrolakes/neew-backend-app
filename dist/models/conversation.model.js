"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    hasUnread: { default: false, type: Boolean },
    lastMessageAt: { default: Date.now, type: Date },
    messages: { ref: "Message", type: [mongoose_1.default.Types.ObjectId] },
    unreadCount: { default: 0, type: Number },
    users: { ref: "User", type: [mongoose_1.default.Types.ObjectId] },
}, {
    timestamps: true,
});
exports.ConversationModel = mongoose_1.default.model("Conversation", schema);
//# sourceMappingURL=conversation.model.js.map