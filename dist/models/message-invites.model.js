"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageInviteModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    inviteStatus: {
        default: "pending",
        required: true,
        type: String,
    },
    receiver: { ref: "User", type: mongoose_1.default.Types.ObjectId },
    sender: { ref: "User", type: mongoose_1.default.Types.ObjectId },
}, {
    timestamps: true,
});
// A model type combining IMessageInviteDocument and Model interfaces
exports.MessageInviteModel = mongoose_1.default.model("MessageInvite", schema);
//# sourceMappingURL=message-invites.model.js.map