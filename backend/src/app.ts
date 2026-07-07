import cors from "cors";
import express from "express";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  })
);
app.use(express.json());

app.use(routes);
app.use(errorHandler);

export default app;
