import path from "path";

import Config from "./config";

const config: Config = {
  env: "test",
  database: "mongodb://127.0.0.1:27017/neew-app-database",
  frontUrl: "http://localhost:3000",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media"
  ),
  smtp: {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "fidel.orn@ethereal.email",
      pass: "ejCD37Fz1FSprHyM9x",
    },
  },
  smtpFrom: '"HER Admin 👻" <admin@shoppick.com>"',
  redis: "redis://localhost:6379",
};

export default config;
