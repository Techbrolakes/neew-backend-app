"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../app");
describe("Init Test", async () => {
    it("Drop Database", async () => {
        await app_1.startPromise;
        await mongoose_1.default.connection.db.dropDatabase();
        console.log("Database Dropped");
        await mongoose_1.default.connection.syncIndexes();
    });
});
//# sourceMappingURL=0.init.test.js.map