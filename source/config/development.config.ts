import path from "path";

import Config from "./config";

const config: Config = {
  env: "development",
  // database: "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/",
  database: "mongodb+srv://bdaiveed:neew2023@neewcluster.dzzdlnv.mongodb.net/?retryWrites=true&w=majority&appName=NeewCluster",
  databaseName: "neew-database",
  frontUrl: "https://neew.io",
  googleKey: "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",
  googleClientId: "571327977366-fda046f96991qq89fo3i4nfgvp0id5b7.apps.googleusercontent.com",
  googleBackendRedirectUri: "https://dev-server.neew.io/auth/google/callback",
  googleFrontendRedirectUri: "https://neew.io/onboarding/login",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media",
  ),
};

export default config;
