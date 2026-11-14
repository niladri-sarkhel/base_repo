// src/routes/api.v1.router.js

import express from "express";

import { testRouter } from "./test.router.js";
import { authRouter } from "./auth.router.js";

export const apiV1Router = express.Router();
apiV1Router.use("/test", testRouter);
apiV1Router.use("/auth", authRouter);