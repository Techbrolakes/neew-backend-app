import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { UserModel } from "../models/user.model";
import authMw from "../middleware/auth.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { paginationUtil, throwIfUndefined } from "../utils";
import { param, query } from "express-validator";
import { FollowModel } from "../models/follow.model";

const debug = Debug("project:user.service");

const getUser = [
  authMw,
  param("userId").isMongoId().withMessage("userId must be a valid id"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const user = await UserModel.findById(req.data.userId).select("-password").lean(true);

      //   get the user's followers
      const followers = await FollowModel.find({ userId: req.data.userId });

      //   get the user's following
      const following = await FollowModel.find({ followerId: req.data.userId });

      const result = {
        user,
        followersCount: followers.length,
        followingCount: following.length,
      };

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "User fetched",
        data: result,
      });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

const getAllUsers = [
  authMw,
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
  query("search").optional().isString().withMessage("Search must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const { page, perpage, locations, industries, interests, search } = req.query as any;

      const filter: any = {};

      if (locations) {
        const locationsArray = locations.split(",").map((location: string) => location.trim());

        // Create a regex pattern to match any of the locations
        const locationPattern = locationsArray.map((location: string) => `(${location})`).join("|");

        filter.location = { $regex: new RegExp(locationPattern, "i") }; // Case-insensitive search
      }

      if (industries) {
        const industriesArray = industries.split(",").map((industry: string) => industry.trim());

        filter.industry = { $in: industriesArray };
      }

      if (interests) {
        const interestsArray = interests.split(",").map((interest: string) => interest.trim());

        filter.interest = { $in: interestsArray };
      }

      if (search) {
        const searchPattern = new RegExp(search, "i");

        filter.$or = [{ firstName: searchPattern }, { lastName: searchPattern }, { email: searchPattern }];
      }

      const users = await UserModel.find(filter)
        .select("-password")
        .lean(true)
        .sort({ createdAt: -1 })
        .limit(perpage)
        .skip(page * perpage - perpage);

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Users fetched",
        data: users,
      });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

const getEntreprenuers = [
  authMw,
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
  query("locations").optional().isString().withMessage("Locations must be a string"),
  query("industries").optional().isString().withMessage("Industries must be a string"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const { locations, industries, page, perpage } = req.query as any;

      // Extract query parameters for location and industry as arrays
      const filter: any = {
        companyLogo: { $exists: true, $ne: null },
        companyName: { $exists: true, $ne: null },
        interest: "entrepreneur",
        revenue: { $exists: true, $ne: null },
      };

      if (locations) {
        const locationsArray = locations.split(",").map((location: string) => location.trim());

        const locationRegex = locationsArray.map((location: string) => `(?=.*${location})`).join("");

        filter.location = { $regex: new RegExp(locationRegex, "i") };
      }

      if (industries) {
        const industriesArray = industries.split(",").map((industry: string) => industry.trim());

        filter.industry = { $in: industriesArray };
      }

      const [entrepreneurs, total] = await Promise.all([
        UserModel.find(filter)
          .select("-password")
          .lean(true)
          .sort({ createdAt: -1 })
          .limit(perpage)
          .skip(page * perpage - perpage),

        UserModel.aggregate([{ $match: filter }, { $count: "count" }]),
      ]);

      const pagination = paginationUtil({ page, perpage, total: total[0]?.count! });

      if (entrepreneurs.length === 0) {
        return ResponseHandler.sendSuccessResponse({
          res,
          code: HTTP_CODES.OK,
          message: "No entreprenuers found",
          data: [],
        });
      }

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "Entreprenuers fetched",
        data: entrepreneurs,
        pagination,
      });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

// const convert = [
//   async (req: express.Request, res: express.Response) => {
//     try {
//       // Update `interest` field
//       await UserModel.updateMany(
//         { interest: { $type: "string" } }, // Find documents where `interest` is a string
//         [
//           { $set: { interest: [{ $arrayElemAt: [{ $split: ["$interest", ","] }, 0] }] } }, // Convert string to array
//         ],
//       );

//       // Update `industry` field
//       await UserModel.updateMany(
//         { industry: { $type: "string" } }, // Find documents where `industry` is a string
//         [
//           { $set: { industry: [{ $arrayElemAt: [{ $split: ["$industry", ","] }, 0] }] } }, // Convert string to array
//         ],
//       );

//       return ResponseHandler.sendSuccessResponse({
//         res,
//         code: HTTP_CODES.OK,
//         message: "Conversion successful",
//       });
//     } catch (error: any) {
//       return ResponseHandler.sendErrorResponse({
//         res,
//         code: HTTP_CODES.INTERNAL_SERVER_ERROR,
//         error: `${error}`,
//       });
//     }
//   },
// ];

export default {
  getEntreprenuers,
  getAllUsers,
  getUser,
  // convert,
};
