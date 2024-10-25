import path from "path";

import Config from "./config";

const config: Config = {
  env: "development",
  // database: "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/",
  database: "mongodb+srv://bdaiveed:neew2023@neewcluster.dzzdlnv.mongodb.net/?retryWrites=true&w=majority&appName=NeewCluster",
  databaseName: "neew-database",
  frontUrl: "https://neew.io",
  // frontUrl: "https://neew-app.vercel.app",
  // frontUrl: "http://localhost:3000",
  googleSecretkey: "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",
  googleClientId: "354745730971-7m8stefuln9oa2ldlqscv2s9jrc766rf.apps.googleusercontent.com",
  googleBackendRedirectUri: "https://dev-server.neew.io/auth/google/callback",
  // googleFrontendRedirectUri: "https://neew-app.vercel.app/onboarding/login",
  googleFrontendRedirectUri: "https://neew.io/onboarding/login",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media",
  ),
};

export default config;
