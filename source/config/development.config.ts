import path from "path";

import Config from "./config";

const config: Config = {
  env: "development",
  database: "mongodb://api:paSs!!2827@herdb-dev.hishk.com:27017/admin",
  databaseName: "admin",
  frontUrl: "https://neew-frontend-app2.vercel.app/",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media",
  ),
};

export default config;
