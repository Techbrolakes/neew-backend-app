import Debug from "debug";
import express from "express";

import jwt from "jsonwebtoken";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import ResponseHandler from "../utils/response-handler";

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
    jwt.verify(token, "neew", (error: any, decoded: any) => {
      if (error) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.UNAUTHORIZED,
          error: error.message,
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } catch (error) {
    return ResponseHandler.sendErrorResponse({
      res,
      code: HTTP_CODES.BAD_REQUEST,
      error: "Invalid Token",
    });
  }
}
