import express from "express";
import { testController } from "#controllers";

export const testRouter = express.Router();

testRouter
    .get("/ping", testController.ping)
    .get("/db", testController.dbTest)