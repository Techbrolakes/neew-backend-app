"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const validator_mw_1 = require("../middleware/validator.mw");
const user_model_1 = require("../models/user.model");
const auth_mw_1 = __importDefault(require("../middleware/auth.mw"));
const response_handler_1 = __importDefault(require("../utils/response-handler"));
const appDefaults_constant_1 = require("../constants/appDefaults.constant");
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const follow_model_1 = require("../models/follow.model");
const constants_1 = require("../constants");
const message_invites_model_1 = require("../models/message-invites.model");
const debug = (0, debug_1.default)("project:user.service");
const getUser = [
    auth_mw_1.default,
    (0, express_validator_1.param)("userId").isMongoId().withMessage("userId must be a valid id"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const user = await user_model_1.UserModel.findById(req.data.userId).select("-password").lean(true);
            //   get the user's followers
            const followers = await follow_model_1.FollowModel.find({ userId: req.data.userId });
            //   get the user's following
            const following = await follow_model_1.FollowModel.find({ followerId: req.data.userId });
            const result = {
                user,
                followersCount: followers.length,
                followingCount: following.length,
            };
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "User fetched",
                data: result,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const getAllUsers = [
    auth_mw_1.default,
    (0, express_validator_1.query)("page").optional().isNumeric().withMessage("Page must be a number"),
    (0, express_validator_1.query)("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
    (0, express_validator_1.query)("search").optional().isString().withMessage("Search must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const { page = 1, perpage = 10, locations, industries, interests, search } = req.query;
            const filter = {};
            if (locations) {
                const locationsArray = locations.split(",").map((location) => location.trim());
                const countryFilter = [];
                const continentFilter = [];
                locationsArray.forEach((loc) => {
                    if (Object.keys(constants_1.continentToCountries).includes(loc)) {
                        continentFilter.push(loc);
                    }
                    else {
                        countryFilter.push(loc);
                    }
                });
                // Create a regex pattern to match any of the locations
                if (continentFilter.length > 0) {
                    continentFilter.forEach((continent) => {
                        if (constants_1.continentToCountries[continent]) {
                            countryFilter.push(...constants_1.continentToCountries[continent]);
                        }
                    });
                }
                if (countryFilter.length > 0) {
                    filter.location = { $regex: new RegExp(countryFilter.join("|"), "i") }; // Case-insensitive search
                }
            }
            if (industries) {
                const industriesArray = industries.split(",").map((industry) => industry.trim());
                filter.industry = { $in: industriesArray };
            }
            if (interests) {
                const interestsArray = interests.split(",").map((interest) => interest.trim());
                filter.interest = { $in: interestsArray };
            }
            if (search) {
                const searchPattern = new RegExp(search, "i");
                filter.$or = [{ firstName: searchPattern }, { lastName: searchPattern }, { email: searchPattern }];
            }
            const users = await user_model_1.UserModel.find(filter)
                .select("-password")
                .lean(true)
                .sort({ createdAt: -1 })
                .limit(perpage)
                .skip((page - 1) * perpage);
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Users fetched",
                data: users,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const getEntreprenuers = [
    auth_mw_1.default,
    (0, express_validator_1.query)("page").optional().isNumeric().withMessage("Page must be a number"),
    (0, express_validator_1.query)("perpage").optional().isNumeric().withMessage("Perpage must be a number"),
    (0, express_validator_1.query)("locations").optional().isString().withMessage("Locations must be a string"),
    (0, express_validator_1.query)("industries").optional().isString().withMessage("Industries must be a string"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            (0, utils_1.throwIfUndefined)(req.user, "req.user");
            const { locations, industries, page, perpage } = req.query;
            // Extract query parameters for location and industry as arrays
            const filter = {
                companyLogo: { $exists: true, $ne: null },
                companyName: { $exists: true, $ne: null },
                interest: "entrepreneur",
                revenue: { $exists: true, $ne: null },
            };
            if (locations) {
                const locationsArray = locations.split(",").map((location) => location.trim());
                const locationRegex = locationsArray.map((location) => `(?=.*${location})`).join("");
                filter.location = { $regex: new RegExp(locationRegex, "i") };
            }
            if (industries) {
                const industriesArray = industries.split(",").map((industry) => industry.trim());
                filter.industry = { $in: industriesArray };
            }
            const [entrepreneurs, total] = await Promise.all([
                user_model_1.UserModel.find(filter)
                    .select("-password")
                    .lean(true)
                    .sort({ createdAt: -1 })
                    .limit(perpage)
                    .skip(page * perpage - perpage),
                user_model_1.UserModel.aggregate([{ $match: filter }, { $count: "count" }]),
            ]);
            const pagination = (0, utils_1.paginationUtil)({ page, perpage, total: total[0]?.count });
            if (entrepreneurs.length === 0) {
                return response_handler_1.default.sendSuccessResponse({
                    res,
                    code: appDefaults_constant_1.HTTP_CODES.OK,
                    message: "No entreprenuers found",
                    data: [],
                });
            }
            return response_handler_1.default.sendSuccessResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.OK,
                message: "Entreprenuers fetched",
                data: entrepreneurs,
                pagination,
            });
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
                error: `${error}`,
            });
        }
    },
];
const userInvitesStatus = [
    auth_mw_1.default,
    (0, express_validator_1.check)("id").isMongoId().withMessage("userId must be a valid id"),
    validator_mw_1.validateResult,
    async (req, res) => {
        try {
            const userId = req.data.id;
            // Fetch all users except the user making the request
            const users = await user_model_1.UserModel.find({ _id: { $ne: userId } });
            // Fetch all invites involving the specified user (either as sender or receiver)
            const invitesSentByUser = await message_invites_model_1.MessageInviteModel.find({ sender: userId });
            const invitesReceivedByUser = await message_invites_model_1.MessageInviteModel.find({ receiver: userId });
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
                const sentInvite = invitesSentByUser.find((invite) => invite.receiver.toString() === user._id.toString());
                // Check if the user received an invite
                const receivedInvite = invitesReceivedByUser.find((invite) => invite.sender.toString() === user._id.toString());
                if (sentInvite && receivedInvite) {
                    if (sentInvite.inviteStatus === "accepted" && receivedInvite.inviteStatus === "accepted") {
                        status = 1;
                    }
                    else if (sentInvite.inviteStatus === "pending" && receivedInvite.inviteStatus === "accepted") {
                        status = 2;
                    }
                    else if (sentInvite.inviteStatus === "accepted" && receivedInvite.inviteStatus === "pending") {
                        status = 3;
                    }
                    else if (receivedInvite.inviteStatus === "rejected") {
                        status = 4;
                    }
                    else if (sentInvite.inviteStatus === "rejected") {
                        status = 5;
                    }
                }
                else if (sentInvite) {
                    if (sentInvite.inviteStatus === "pending") {
                        status = 2;
                    }
                }
                else if (receivedInvite) {
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
        }
        catch (error) {
            return response_handler_1.default.sendErrorResponse({
                res,
                code: appDefaults_constant_1.HTTP_CODES.INTERNAL_SERVER_ERROR,
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
exports.default = {
    getEntreprenuers,
    getAllUsers,
    getUser,
    userInvitesStatus,
    // convert,
};
//# sourceMappingURL=user.service.js.map