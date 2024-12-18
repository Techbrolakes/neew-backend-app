import express from "express";
import Debug from "debug";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { body } from "express-validator";
import { getLinkPreview } from "link-preview-js";
import redis, { CACHE_TTL } from "../init/redisInit";

const debug = Debug("project:general.service");

const linkPreview = [
  body("url").isURL().withMessage("Invalid URL").notEmpty().withMessage("URL is required"),
  async (req: express.Request, res: express.Response) => {
    try {
      const { url } = req.body;

      if (!url) {
        return ResponseHandler.sendErrorResponse({
          res,
          code: HTTP_CODES.BAD_REQUEST,
          error: "URL is required",
        });
      }

      const cachedData = await redis.get(url);
      if (cachedData) {
        return ResponseHandler.sendSuccessResponse({
          res,
          code: HTTP_CODES.OK,
          data: JSON.parse(cachedData),
        });
      }

      // Step 2: Fetch Metadata Using link-preview-js
      const metadata = await getLinkPreview(url);

      // Step 3: Store Metadata in Redis Cache with TTL
      await redis.setex(url, CACHE_TTL, JSON.stringify(metadata));

      // Step 4: Send Response
      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        data: metadata,
      });
    } catch (error: any) {
      debug(`Error fetching metadata: ${error.message}`);
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: "Failed to fetch metadata for the provided URL.",
      });
    }
  },
];

export default {
  linkPreview,
};
