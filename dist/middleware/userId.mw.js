"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const mongoose_1 = __importDefault(require("mongoose"));
// eslint-disable-next-line
const debug = (0, debug_1.default)("project:user.mw");
async function shopId(req, res, next) {
    const shopId = req.headers["shop-id"];
    if (!shopId) {
        res.status(401).json({ message: "missingShopId" });
        return;
    }
    if (!mongoose_1.default.isValidObjectId(shopId)) {
        res.status(401).json({ message: "invalidShopId" });
        return;
    }
    if (!shop) {
        res.status(401).json({ message: "shopIdNotExists" });
        return;
    }
    req.shop = shop;
    req.locale = shop.default_locale;
    next();
}
exports.default = shopId;
//# sourceMappingURL=userId.mw.js.map