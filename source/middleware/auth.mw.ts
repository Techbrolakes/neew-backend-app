import Debug from "debug";
import express from "express";

import { HTTP_CODES } from "../constants/appDefaults.constant";
import ResponseHandler from "../utils/response-handler";
import frontUserUtil from "../utils/frontUser.utils";

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
    const user = await frontUserUtil.decodeAccessToken(token);

    if (!user) {
      res.status(401).json({ message: "Invalid user" });
      return;
    }

    req.user = { id: user.id };
    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: "Invalid Token" });
  }
}
