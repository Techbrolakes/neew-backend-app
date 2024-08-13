import mongoose from "mongoose";

export interface ICompany {
  traction: string;
  usp: string;
  website: string;
  productMaturity: string;
  revenue: string;
  sdgImpact: string[];
  operatingAddress: string;
  communityImpact: string;
  companyLogo: string;
  companyName: string;
  ebitda: string;
  exitFounder: string;
  exitMethod: string;
  exitStrategy: string;
  exitTimeFrame: string;
  forecastedEbitda: string;
  founderValuation: string;
  founderValuationLogic: string;
  foundingYear: string;
  growthTrend: string;
  locationOfRegistration: string;
  networkWants: string;
}

const CompanySchema = new mongoose.Schema({
  traction: { required: false, type: String },
  usp: { required: false, type: String },
  website: { required: false, type: String },
  productMaturity: { required: false, type: String },
  revenue: { required: false, type: String },
  sdgImpact: { default: [], type: [String] },
  operatingAddress: { required: false, type: String },
  communityImpact: { required: false, type: String },
  companyLogo: { required: false, type: String },
  companyName: { required: false, type: String },
  ebitda: { required: false, type: String },
  exitFounder: { required: false, type: String },
  exitMethod: { required: false, type: String },
  exitStrategy: { required: false, type: String },
  exitTimeFrame: { required: false, type: String },
  forecastedEbitda: { required: false, type: String },
  founderValuation: { required: false, type: String },
  founderValuationLogic: { required: false, type: String },
  foundingYear: { required: false, type: String },
  growthTrend: { required: false, type: String },
  locationOfRegistration: { required: false, type: String },
  networkWants: { required: false, type: String },
});

// A document type combining ICompany and Document interfaces
export interface ICompanyDocument extends mongoose.Document, ICompany {}

// A model type combining ICompanyDocument and Model interfaces
export const CompanyModel = mongoose.model<ICompanyDocument>("Company", CompanySchema);
