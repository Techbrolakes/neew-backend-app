import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";

import route from "../routes/route";

function middlewareNotFound(req: express.Request, res: express.Response, next: express.NextFunction) {
  const err = new Error("Not Found: " + req.url) as any;
  err.status = 404;
  next(err);
}

function middlewareError(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  console.error("500 Error", err);

  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
  });
}

function setupExpress(app: Express) {
  console.log("Start Setting Up Express");

  app.disable("x-powered-by");
  app.use(morgan("dev"));

  app.use(
    express.json({
      limit: "50mb",
      verify: (req, res, buf, encoding) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.use(cors());

  app.use("/api", route);

  app.use(middlewareNotFound);
  app.use(middlewareError);

  console.log("Finish setting up Express");
}

export default {
  setupExpress,
};
