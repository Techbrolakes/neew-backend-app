"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPromise = void 0;
require("source-map-support/register");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dbInit_1 = __importDefault(require("./init/dbInit"));
const expressInit_1 = __importDefault(require("./init/expressInit"));
const socket_1 = __importDefault(require("./socket"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
async function start() {
    await dbInit_1.default.connect();
    expressInit_1.default.setupExpress(app); // Set up Express middleware and routes
    (0, socket_1.default)(server); // Initialize Socket.IO with the HTTP server
}
exports.startPromise = start();
// Start the server
server.listen(process.env.PORT || 9001, () => {
    console.log(`Server is listening on port ${process.env.PORT || 9001}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map