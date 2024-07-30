import path from "path";

import Config from "./config";

const config: Config = {
  env: "development",
  database: "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/",
  databaseName: "neew-database",
  frontUrl: "https://neew-frontend-app.vercel.app/",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media",
  ),
};

export default config;
