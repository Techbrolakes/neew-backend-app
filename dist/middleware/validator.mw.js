"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResult = void 0;
const express_validator_1 = require("express-validator");
async function validateResult(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const msg = { errors: errors.mapped() };
        return res.status(422).json(msg);
    }
    req.data = (0, express_validator_1.matchedData)(req);
    next();
}
exports.validateResult = validateResult;
//# sourceMappingURL=validator.mw.js.map