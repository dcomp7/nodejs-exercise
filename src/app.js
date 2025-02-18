import * as Sentry from "@sentry/node";
import sentryConfig from "./config/sentry.js";
import express from "express";
import Youch from "youch";
import "express-async-errors";
import routes from "./app/routes.js";
import "./database/index.js";

class App {
  constructor() {
    this.server = express();
    this.setupErrorMonitoring();
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  setupErrorMonitoring() {
    Sentry.init(sentryConfig);
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      );
      next();
    });
  }

  exceptionHandler() {
    Sentry.setupExpressErrorHandler(this.server);
    this.server.use(async (err, req, res) => {
      if (process.env.NODE_ENV === "development") {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: "Internal server error" });
    });
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
