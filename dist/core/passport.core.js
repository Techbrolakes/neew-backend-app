"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: "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",
    clientSecret: "571327977366-fda046f96991qq89fo3i4nfgvp0id5b7.apps.googleusercontent.com",
    callbackURL: "http://localhost:9001/api/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);
    console.log("profile", profile);
    // Here, you can save the user info to your database or session
    done(null, profile);
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.core.js.map