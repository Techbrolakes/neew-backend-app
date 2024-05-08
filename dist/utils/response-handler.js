"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sendSuccessResponse({ res, code = 200, message = "Operation Successful", data = null, custom = false, }) {
    const response = custom && data ? { ...data } : { success: true, code: code, message, data };
    return res.status(code).json(response);
}
function sendErrorResponse({ res, code, error = "Operation failed", custom = false, type, }) {
    const response = custom
        ? { success: false, code: code, message: error, type }
        : { success: false, code: code, message: error };
    return res.status(code).json(response);
}
const ResponseHandler = {
    sendSuccessResponse,
    sendErrorResponse,
};
exports.default = ResponseHandler;
//# sourceMappingURL=response-handler.js.map