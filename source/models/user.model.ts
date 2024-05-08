import mongoose, { Schema } from "mongoose";

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  photo?: string;
  interest: string;
  locationOfRegistration?: string;
  location: string;
  operatingAddress?: string;
  telephone?: string;
  website?: string;
  industry?: string;
  foundingYear?: string;
  networkWants?: string;
  usp?: string;
  communityImpact?: string;
  sdgImpact?: string;
  revenue?: string;
  ebitda?: string;
  forecastedEbitda?: string;
  traction?: string;
  productMaturity?: string;
  growthTrend?: string;
  exitFounder?: string;
  exitStrategy?: string;
  exitTimeFrame?: string;
  exitMethod?: string;
  founderValuation?: string;
  founderValuationLogic?: string;
  companyName?: string;
  companyLogo?: string;
}

const UserSchema: Schema = new Schema(
  {
    communityImpact: { required: false, type: String },
    companyLogo: { required: false, type: String },
    companyName: { required: false, type: String },
    ebitda: { required: false, type: String },
    email: { required: true, type: String, unique: true },
    exitFounder: { required: false, type: String },
    exitMethod: { required: false, type: String },
    exitStrategy: { required: false, type: String },
    exitTimeframe: { required: false, type: String },
    firstName: { required: true, type: String },
    forecastedEbitda: { required: false, type: String },
    founderValuation: { required: false, type: String },
    founderValuationLogic: { required: false, type: String },
    foundingDate: { required: false, type: Date },
    growthTrend: { required: false, type: String },
    industry: { required: false, type: String },
    interest: {
      default: "general_interest",
      enum: ["general_interest", "entrepreneur", "social_progress", "investors", "eco_system_builder"],
      type: String,
    },
    lastName: { required: true, type: String },
    location: { required: true, type: String },
    locationOfRegistration: { required: false, type: String },
    networkWants: { required: false, type: String },
    operatingAddress: { required: false, type: String },
    password: { required: true, type: String },
    photo: { required: false, type: String },
    productMaturity: { required: false, type: String },
    revenue: { required: false, type: String },
    sdgImpact: { required: false, type: String },
    telephone: { required: false, type: String },
    traction: { required: false, type: String },
    usp: { required: false, type: String },
    website: { required: false, type: String },
  },
  { timestamps: true },
);

// A document type combining IUser and Document interfaces
export interface IUserDocument extends mongoose.Document, IUser {}

// A model type extending the mongoose Model interface
export const UserModel = mongoose.model<IUserDocument>("Users", UserSchema);
