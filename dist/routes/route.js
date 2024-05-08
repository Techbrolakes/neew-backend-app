"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_service_1 = __importDefault(require("../services/user/user.service"));
const router = express_1.default.Router();
router.post("/users/register", user_service_1.default.register);
exports.default = router;
//# sourceMappingURL=route.js.map