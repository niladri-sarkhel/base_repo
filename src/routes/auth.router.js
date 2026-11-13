import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "#lib";

export const authRouter = express.Router();

// Better Auth automatically exposes endpoints under /api/auth/* (e.g., /sign-up, /sign-in)
authRouter.all("/*splat", toNodeHandler(auth));