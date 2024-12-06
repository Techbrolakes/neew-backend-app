import "source-map-support/register";

import express from "express";
import http from "http";
import dbInit from "./init/dbInit";
import expressInit from "./init/expressInit";
import socket from "./socket";
import session from "express-session";
import passport from "./core/passport.core";
import { OAuth2Client } from "google-auth-library";
import ResponseHandler from "./utils/response-handler";
import { HTTP_CODES } from "./constants/appDefaults.constant";
import { UserModel } from "./models/user.model";
import { generateToken } from "./utils";
import cors from "cors";
import config from "./utils/config";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(session({ secret: "neew-server", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

const oauth2Client = new OAuth2Client(config.googleClientId, config.googleSecretkey, config.googleBackendRedirectUri);

app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "select_account",
  });

  return ResponseHandler.sendSuccessResponse({
    res,
    code: HTTP_CODES.OK,
    message: "Success",
    data: { authUrl: url },
  });
});

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;
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
  const existingUser: any = await UserModel.findOne({ email: user.email });

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

    token = await generateToken({
      id: existingUser._id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
    });
  } else {
    const newUser: any = await UserModel.create({
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

    token = await generateToken({
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    });
  }
  res.redirect(`https://neew.io/onboarding/auth-step-2?token=${token}&planId=NmdEOxQ0&user=${JSON.stringify(userDetails)}`);
});

async function start() {
  await dbInit.connect();
  expressInit.setupExpress(app); // Set up Express middleware and routes
  socket(server); // Initialize Socket.IO with the HTTP server
}

export const startPromise = start();

// Start the server
server.listen(process.env.PORT || 9001, () => {
  console.log(`Server is listening on port ${process.env.PORT || 9001}`);
});

export default app;
