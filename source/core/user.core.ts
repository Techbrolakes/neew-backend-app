import { UserModel } from "../models/user.model";
import { IUserDocument } from "../models/user.model";
import { FilterQuery, Types } from "mongoose";

function create(user: IUserDocument): Promise<IUserDocument> {
  return UserModel.create(user);
}

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

const UserCore = {
  create,
  getById,
  getByEmail,
  getByQuery,
};

export default UserCore;
