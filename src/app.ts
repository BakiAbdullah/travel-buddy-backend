import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import config from "./config";
import router from "./app/routes";

const app: Application = express();
app.use(
  cors({
    origin: "http://localhost:3000", // need to change with live link
    credentials: true,
  })
);

//parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Travel Buddy Server is Running..",
    environment: config.node_env,
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
