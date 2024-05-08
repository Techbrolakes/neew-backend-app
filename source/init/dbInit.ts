import mongoose from "mongoose";

import config from "../utils/config";

async function connect(): Promise<typeof mongoose> {
  const m = await mongoose.connect(config.database, { dbName: config.databaseName });
  await mongoose.connection.syncIndexes();

  console.log("Connected to Database: ", config.database);
  return m;
}

export default {
  connect,
};
