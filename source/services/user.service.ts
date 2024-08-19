import express from "express";
import Debug from "debug";
import { validateResult } from "../middleware/validator.mw";
import { UserModel } from "../models/user.model";
import authMw from "../middleware/auth.mw";
import ResponseHandler from "../utils/response-handler";
import { HTTP_CODES } from "../constants/appDefaults.constant";
import { paginationUtil, throwIfUndefined } from "../utils";
import { check, param, query } from "express-validator";
import { FollowModel } from "../models/follow.model";
import { continentToCountries } from "../constants";
import { MessageInviteModel } from "../models/message-invites.model";

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

      const { page = 1, perpage = 10, locations, industries, interests, search } = req.query as any;

      const filter: any = {};

      if (locations) {
        const locationsArray = locations.split(",").map((location: string) => location.trim());
        const countryFilter: string[] = [];
        const continentFilter: string[] = [];

        locationsArray.forEach((loc: string) => {
          if (Object.keys(continentToCountries).includes(loc)) {
            continentFilter.push(loc);
          } else {
            countryFilter.push(loc);
          }
        });

        // Create a regex pattern to match any of the locations
        if (continentFilter.length > 0) {
          continentFilter.forEach((continent: string) => {
            if (continentToCountries[continent]) {
              countryFilter.push(...continentToCountries[continent]);
            }
          });
        }

        if (countryFilter.length > 0) {
          filter.location = { $regex: new RegExp(countryFilter.join("|"), "i") }; // Case-insensitive search
        }
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
        .skip((page - 1) * perpage);

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

const userInvitesStatus = [
  authMw,
  check("id").isMongoId().withMessage("userId must be a valid id"),
  validateResult,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.data.id;

      // Fetch all users except the user making the request
      const users = await UserModel.find({ _id: { $ne: userId } });

      // Fetch all invites involving the specified user (either as sender or receiver)
      const invitesSentByUser = await MessageInviteModel.find({ sender: userId });
      const invitesReceivedByUser = await MessageInviteModel.find({ receiver: userId });

      // Prepare the response data
      const userInviteStatus = users.map((user) => {
        // 1.⁠ ⁠Connected
        // 2.⁠ ⁠⁠You sent to him and pending
        // 3.⁠ ⁠⁠He sent to you and pending
        // 4.⁠ ⁠⁠He declined
        // 5.⁠ ⁠⁠You declined
        // 6.⁠ ⁠⁠Nobody has sent

        let status = 6;

        // Check if the user sent an invite
        const sentInvite: any = invitesSentByUser.find((invite) => invite.receiver.toString() === user._id.toString());

        // Check if the user received an invite
        const receivedInvite: any = invitesReceivedByUser.find((invite) => invite.sender.toString() === user._id.toString());

        if (sentInvite && receivedInvite) {
          if (sentInvite.inviteStatus === "accepted" && receivedInvite.inviteStatus === "accepted") {
            status = 1;
          } else if (sentInvite.inviteStatus === "pending" && receivedInvite.inviteStatus === "accepted") {
            status = 2;
          } else if (sentInvite.inviteStatus === "accepted" && receivedInvite.inviteStatus === "pending") {
            status = 3;
          } else if (receivedInvite.inviteStatus === "rejected") {
            status = 4;
          } else if (sentInvite.inviteStatus === "rejected") {
            status = 5;
          }
        } else if (sentInvite) {
          if (sentInvite.inviteStatus === "pending") {
            status = 2;
          }
        } else if (receivedInvite) {
          if (receivedInvite.inviteStatus === "pending") {
            status = 3;
          }
        }

        return {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          photo: user.photo,
          status,
        };
      });

      return res.status(200).json({ users: userInviteStatus });
    } catch (error: any) {
      return ResponseHandler.sendErrorResponse({
        res,
        code: HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: `${error}`,
      });
    }
  },
];

// const updateUsersProvider = [
//   async (req: express.Request, res: express.Response) => {
//     try {
//       const result = await UserModel.updateMany(
//         {}, // No filter, so this applies to all users
//         [
//           {
//             $set: {
//               provider: "local",
//               provider_id: "$email",
//             },
//           },
//         ],
//       );

//       return ResponseHandler.sendSuccessResponse({
//         res,
//         code: HTTP_CODES.OK,
//         message: `Updated ${result.modifiedCount} users' provider fields`,
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
  userInvitesStatus,
  // convert,
};
