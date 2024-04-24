import path from "path";

import Config from "./config";

const config: Config = {
  env: "development",
  database: "mongodb://api:paSs!!2827@herdb-dev.hishk.com:27017/admin",
  frontUrl: "https://heradmin-dev.hishk.com",
  imageFolder: path.join(
    __dirname,
    "..", // src
    "..", // root
    "media"
  ),
  smtp: {
    host: "mail.hisher.hk",
    port: 465,
    auth: {
      user: "hi@hisher.hk",
      pass: "vcmn;f?PH-MU",
    },
  },
  smtpFrom: '"HER Robot 👻" <hi@hisher.hk>"',
  redis: "redis://redis:6379",
};

export default config;
