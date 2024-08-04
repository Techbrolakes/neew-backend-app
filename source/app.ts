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
  expressInit.setupExpress(app); // Set up Express middleware and routes
  socket(server); // Initialize Socket.IO with the HTTP server
}

export const startPromise = start();

// Start the server
server.listen(process.env.PORT || 9001, () => {
  console.log(`Server is listening on port ${process.env.PORT || 9001}`);
});

export default app;
