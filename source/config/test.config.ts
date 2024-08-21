import path from "path";

import Config from "./config";

const config: Config = {
  env: "test",
  database: "mongodb://127.0.0.1:27017/neew-database",
  databaseName: "neew-database",
  frontUrl: "http://localhost:3000",
  googleSecretkey: "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",
  googleClientId: "354745730971-7m8stefuln9oa2ldlqscv2s9jrc766rf.apps.googleusercontent.com",
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
