"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const route_1 = __importDefault(require("../routes/route"));
function middlewareNotFound(req, res, next) {
    const err = new Error("Not Found: " + req.url);
    err.status = 404;
    next(err);
}
function middlewareError(err, req, res, next) {
    console.error("500 Error", err);
    res.status(err.status || 500);
    res.json({
        status: err.status || 500,
        message: err.message,
    });
}
function setupExpress(app) {
    console.log("Start Setting Up Express");
    app.disable("x-powered-by");
    app.use((0, morgan_1.default)("dev"));
    app.use(express_1.default.json({
        limit: "50mb",
        verify: (req, res, buf, encoding) => {
            req.rawBody = buf.toString();
        },
    }));
    app.use((0, cors_1.default)());
    app.use("/api", route_1.default);
    app.use(middlewareNotFound);
    app.use(middlewareError);
    console.log("Finish setting up Express");
}
exports.default = {
    setupExpress,
};
//# sourceMappingURL=expressInit.js.map