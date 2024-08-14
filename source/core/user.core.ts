import { IUser, UserModel } from "../models/user.model";
import bcrypt from "bcrypt";
import { IUserDocument } from "../models/user.model";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import express from "express";
import { searchUtil, timeUtil } from "../utils";

// get user by id
function getById({ _id }: { _id: Types.ObjectId }): Promise<IUserDocument> {
  return UserModel.findOne({ _id }).lean();
}

// get user by email
function getByEmail(email: string): Promise<IUserDocument | null> {
  return UserModel.findOne({ email }).lean();
}

// get by query
function getByQuery(query: FilterQuery<IUserDocument>, select: any = ""): Promise<IUserDocument | null> {
  return UserModel.findOne(query).select(select).lean();
}

// atomic update
function atomicUpdate(userId: Types.ObjectId, record: UpdateQuery<IUserDocument>, session: any = null) {
  return UserModel.findOneAndUpdate({ _id: userId }, { ...record }, { new: true, session });
}

// find all users
async function getAll(req: express.Request): Promise<IUserDocument[] | null | any> {
  const { query } = req;

  const search = String(query.search);
  const perpage = Number(query.perpage) || 10;
  const page = Number(query.page) || 1;
  const dateFrom = query.dateFrom || "Jan 1 2021";
  const dateTo = query.dateTo || `${Date()}`;
  const period = String(query.period); // Set the period for filtering

  const timeFilter = await timeUtil({ period, dateFrom, dateTo });

  const searching = searchUtil({
    search: search,
    searchArray: ["firstName", , "lastName", "email"],
  });

  const filter: any = { ...searching, ...timeFilter };

  // Get the plan documents from the database
  const users = await UserModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(perpage)
    .skip(page * perpage - perpage);

  const total = await UserModel.countDocuments(filter);

  return Promise.resolve({
    data: users,
    pagination: {
      hasPrevious: page > 1, // Check if there is a previous page
      prevPage: page - 1, // Get the previous page number
      hasNext: page < Math.ceil(total / perpage), // Check if there is a next page
      next: page + 1, // Get the next page number
      currentPage: Number(page), // Get the current page number
      total: total, // Get the total number of records
      pageSize: perpage, // Get the page size
      lastPage: Math.ceil(total / perpage),
    },
  });
}

async function create({
  email,
  firstName,
  interest,
  lastName,
  location,
  password,
  telephone,
  website,
  communityImpact,
  foundingYear,
  industry,
  locationOfRegistration,
  networkWants,
  operatingAddress,
  photo,
  revenue,
  sdgImpact,
  traction,
  productMaturity,
  growthTrend,
  exitFounder,
  exitStrategy,
  exitTimeFrame,
  exitMethod,
  forecastedEbitda,
  founderValuation,
  founderValuationLogic,
  companyName,
  companyLogo,
  ebitda,
  usp,
  provider,
  provider_id,
}: IUser): Promise<IUserDocument> {
  const data = {
    email: email.trim().toLowerCase(),
    firstName: firstName.trim().toLocaleLowerCase(),
    interest,
    lastName: lastName.trim().toLocaleLowerCase(),
    location,
    password,
    telephone,
    website,
    communityImpact,
    foundingYear,
    industry,
    locationOfRegistration,
    networkWants,
    operatingAddress,
    photo,
    revenue,
    sdgImpact,
    traction,
    productMaturity,
    growthTrend,
    exitFounder,
    exitStrategy,
    exitTimeFrame,
    exitMethod,
    forecastedEbitda,
    founderValuation,
    founderValuationLogic,
    companyName,
    companyLogo,
    ebitda,
    usp,
    provider,
    provider_id,
  };

  // If password is provided, generate salt and hash it
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    data.password = bcrypt.hashSync(password, salt);
  }

  // Create a new user with the given data
  const user = new UserModel(data);

  // Save the user to the database
  return await UserModel.create(user);
}

const UserCore = {
  create,
  getById,
  getByEmail,
  getByQuery,
  atomicUpdate,
  getAll,
};

export default UserCore;
