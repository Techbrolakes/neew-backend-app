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
exports.PostModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const commentSchema = new mongoose_1.Schema({
    comment: { required: true, type: String },
    post: { ref: "Post", type: mongoose_1.Types.ObjectId },
    user: { ref: "User", type: mongoose_1.Types.ObjectId },
});
const schema = new mongoose_1.Schema({
    comments: {
        default: [],
        type: [commentSchema],
    },
    content: { required: true, type: String },
    creator: { ref: "User", type: mongoose_1.Types.ObjectId },
    image: { type: String },
    likesUsers: [{ ref: "User", type: mongoose_1.Types.ObjectId }],
    numberOfComments: { default: 0, type: Number },
    totalLikes: { default: 0, type: Number },
}, { timestamps: true });
// A model type combining IPostDocument and Model interfaces
exports.PostModel = mongoose_1.default.model("Post", schema);
//# sourceMappingURL=post.model.js.map