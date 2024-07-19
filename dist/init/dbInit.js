"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../utils/config"));
const currentDB = "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/" || config_1.default.database;
async function connect() {
    const m = await mongoose_1.default.connect(currentDB, {
        dbName: config_1.default.databaseName,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 0,
    });
    console.log("Connected to Database: ", currentDB);
    return m;
}
exports.default = {
    connect,
};
//# sourceMappingURL=dbInit.js.map