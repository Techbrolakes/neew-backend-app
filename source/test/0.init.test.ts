import mongoose from "mongoose";

import { startPromise } from "../app";

describe("Init Test", async () => {
  it("Drop Database", async () => {
    await startPromise;
    await mongoose.connection.db.dropDatabase();
    console.log("Database Dropped");

    await mongoose.connection.syncIndexes();
  });
});
