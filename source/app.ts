import "source-map-support/register";

import express from "express";

import dbInit from "./init/dbInit";
import expressInit from "./init/expressInit";

const app = express();

async function start() {
  await dbInit.connect();
  expressInit.setupExpress(app);
}

export const startPromise = start();

export default app;
