"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const route_1 = __importDefault(require("../routes/route"));
const testRoute_1 = __importDefault(require("../routes/testRoute"));
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
    const port = normalizePort(process.env.PORT || "9001");
    app.use("/api", route_1.default);
    if (process.env.NODE_ENV === "test") {
        app.use("/api/test", testRoute_1.default);
    }
    app.use(middlewareNotFound);
    app.use(middlewareError);
    app.listen(port, () => {
        console.log(`Express start listening to port: ${port.toString()}`);
    });
    console.log("finish setting up Express");
    return app;
}
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
exports.default = {
    setupExpress,
};
//# sourceMappingURL=expressInit.js.map