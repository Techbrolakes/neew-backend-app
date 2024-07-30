import "source-map-support/register";

import express from "express";
import http from "http";
import dbInit from "./init/dbInit";
import expressInit from "./init/expressInit";
import socket from "./socket";

const app = express();
const server = http.createServer(app);



async function start() {
  await dbInit.connect();
  expressInit.setupExpress(app);
}

// Initialize Socket.IO
socket(server);

export const startPromise = start();

export default app;
