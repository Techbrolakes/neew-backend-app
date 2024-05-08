"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_service_1 = __importDefault(require("../services/user/auth.service"));
const post_service_1 = __importDefault(require("../services/user/post.service"));
const router = express_1.default.Router();
router.post("/auth/register", auth_service_1.default.register);
router.post("/auth/login", auth_service_1.default.login);
router.get("/posts", post_service_1.default.list);
router.get("/post/getAll", post_service_1.default.getAll);
router.post("/post/create", post_service_1.default.create);
exports.default = router;
//# sourceMappingURL=route.js.map