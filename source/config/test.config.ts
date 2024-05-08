import path from "path";

import Config from "./config";

const config: Config = {
  env: "test",
  database: "mongodb://127.0.0.1:27017/neew-database",
  databaseName: "neew-database",
  frontUrl: "http://localhost:3000",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media",
  ),
};

export default config;