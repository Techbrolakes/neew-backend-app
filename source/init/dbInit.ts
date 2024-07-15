import mongoose from "mongoose";

import config from "../utils/config";

const currentDB = "mongodb+srv://lekandar:helloworld@neew-cluster.5wiort4.mongodb.net/" || config.database;

async function connect(): Promise<typeof mongoose> {
  const m = await mongoose.connect(currentDB, {
    dbName: config.databaseName,
  });
  await mongoose.connection.syncIndexes();

  console.log("Connected to Database: ", currentDB);
  return m;
}

export default {
  connect,
};
