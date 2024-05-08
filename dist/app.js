"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPromise = void 0;
require("source-map-support/register");
const express_1 = __importDefault(require("express"));
const dbInit_1 = __importDefault(require("./init/dbInit"));
const expressInit_1 = __importDefault(require("./init/expressInit"));
const app = (0, express_1.default)();
async function start() {
    await dbInit_1.default.connect();
    expressInit_1.default.setupExpress(app);
}
exports.startPromise = start();
exports.default = app;
//# sourceMappingURL=app.js.map