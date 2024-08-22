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
const express_session_1 = __importDefault(require("express-session"));
const passport_core_1 = __importDefault(require("./core/passport.core"));
const google_auth_library_1 = require("google-auth-library");
const response_handler_1 = __importDefault(require("./utils/response-handler"));
const appDefaults_constant_1 = require("./constants/appDefaults.constant");
const user_model_1 = require("./models/user.model");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./utils/config"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Middleware
app.use((0, express_session_1.default)({ secret: "neew-server", resave: false, saveUninitialized: true }));
app.use(passport_core_1.default.initialize());
app.use(passport_core_1.default.session());
app.use((0, cors_1.default)());
const oauth2Client = new google_auth_library_1.OAuth2Client(config_1.default.googleClientId, config_1.default.googleSecretkey, config_1.default.googleBackendRedirectUri);
app.get("/auth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
        prompt: "select_account",
    });
    return response_handler_1.default.sendSuccessResponse({
        res,
        code: appDefaults_constant_1.HTTP_CODES.OK,
        message: "Success",
        data: { authUrl: url },
    });
});
app.get("/auth/google/callback", async (req, res) => {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!userInfoResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoResponse.statusText}`);
    }
    const user = await userInfoResponse.json();
    const existingUser = await user_model_1.UserModel.findOne({ email: user.email });
    let userDetails;
    let token;
    if (existingUser) {
        userDetails = {
            id: existingUser._id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            photo: existingUser.photo,
            isCompleteProfile: existingUser?.interest?.length > 0 && existingUser?.location ? true : false,
            createdAt: existingUser.createdAt,
        };
        token = await (0, utils_1.generateToken)({
            id: existingUser._id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
        });
    }
    else {
        const newUser = await user_model_1.UserModel.create({
            firstName: user.given_name,
            lastName: user.family_name,
            email: user.email,
            photo: user.picture,
            provider: "google",
        });
        userDetails = {
            id: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            photo: newUser.photo,
            createdAt: newUser.createdAt,
            isCompleteProfile: newUser?.interest?.length > 0 && newUser?.location ? true : false,
        };
        token = await (0, utils_1.generateToken)({
            id: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        });
    }
    // Redirect to frontend with tokens and user details
    // res.redirect(`${config.frontUrl}/onboarding/auth-step-2?token=${token}&planId=NmdEOxQ0&user=${JSON.stringify(userDetails)}`);
    res.redirect(`https://neew-app.vercel.app/onboarding/auth-step-2?token=${token}&planId=NmdEOxQ0&user=${JSON.stringify(userDetails)}`);
});
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