import express from "express";
import Debug from "debug";
import { validateResult } from "../../middleware/validator.mw";
import { UserModel } from "../../models/user.model";
import authMw from "../../middleware/auth.mw";
import ResponseHandler from "../../utils/response-handler";
import { HTTP_CODES } from "../../constants/appDefaults.constant";
import { paginationUtil, throwIfUndefined } from "../../utils";
import { query } from "express-validator";

const debug = Debug("project:user.service");

const getAllUsers = [
  authMw,
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      throwIfUndefined(req.user, "req.user");

      const { page, perpage } = req.query as any;

      const users = await UserModel.find()
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

const me = [
  authMw,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = throwIfUndefined(req.user, "req.user");

      const currentUser = await UserModel.findById(user.id).select("-password").lean(true);

      return ResponseHandler.sendSuccessResponse({
        res,
        code: HTTP_CODES.OK,
        message: "User fetched successfully",
        data: currentUser,
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

export default {
  getEntreprenuers,
  me,
  getAllUsers,
};
