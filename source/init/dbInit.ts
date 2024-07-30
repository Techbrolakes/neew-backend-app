import mongoose from "mongoose";

import config from "../utils/config";

async function connect(): Promise<typeof mongoose> {
  const m = await mongoose.connect(config.database, {
    dbName: config.databaseName,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 0,
  });
  console.log("Connected to Database: ", config.database);
  return m;
}

export default {
  connect,
};
