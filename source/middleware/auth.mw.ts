import Debug from "debug";
import express from "express";

import { HTTP_CODES } from "../constants/appDefaults.constant";
import ResponseHandler from "../utils/response-handler";
import { TokenPayload } from "google-auth-library";
import { AuthProvider, IUserDocument, UserModel } from "../models/user.model";
import frontUserUtil, { DecodedToken, LocalTokenPayload } from "../utils/frontUser.utils";

// eslint-disable-next-line
const debug = Debug("project:auth.mw");

export default async function authMw(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header("x-auth-token") || req.header("Authorization");

  if (!token) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.UNAUTHORIZED,
      error: "Access denied. No token provided",
    });
  }

  try {
    const decoded = await frontUserUtil.decodeToken(token);

    const user = await getUser(decoded);

    if (!user) {
      res.status(401).json({ message: "invalidUser" });
      return;
    }

    req.user = { id: user._id };
    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: "invalidToken" });
  }
}

async function getUser(decoded: DecodedToken) {
  switch (decoded.provider) {
    case "local":
      return await UserModel.findById((decoded.payload as LocalTokenPayload).id, ["_id"]).lean();
    case "google":
      return await getUserFromGoogleToken(decoded.payload as TokenPayload);
    default:
      return undefined;
  }
}

async function getUserFromGoogleToken(payload: TokenPayload): Promise<IUserDocument> {
  const foundUser = await getUserFromExternal(AuthProvider.google, payload.sub);

  if (foundUser) {
    return foundUser;
  }

  return await UserModel.create({
    firstName: payload.given_name,
    lastName: payload.family_name,
    email: payload.email,
    photo: payload.picture,
    provider: AuthProvider.google,
    provider_id: payload.sub,
  });
}

async function getUserFromExternal(provider: AuthProvider, providerId: string) {
  return await UserModel.findOne(
    {
      provider,
      provider_id: providerId,
    },
    ["_id"],
  ).lean();
}
