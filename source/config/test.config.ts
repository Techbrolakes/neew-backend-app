import path from "path";

import Config from "./config";

const config: Config = {
  env: "test",
  database: "mongodb://127.0.0.1:27017/neew-database",
  databaseName: "neew-database",
  frontUrl: "http://localhost:3000",
  googleKey: "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",
  googleClientId: "571327977366-fda046f96991qq89fo3i4nfgvp0id5b7.apps.googleusercontent.com",
  googleBackendRedirectUri: "http://localhost:9001/auth/google/callback",
  googleFrontendRedirectUri: "http://localhost:3000/onboarding/login",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media",
  ),
};

export default config;
