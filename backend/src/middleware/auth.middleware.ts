import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { User } from "../models/index.js";

const getJwtSecret = () => process.env.JWT_SECRET ?? "development-only-secret";

type TokenPayload = { userId: string };

export const requireAuth = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const header = request.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as TokenPayload;
    const user = await User.findByPk(payload.userId, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      response.status(401).json({ message: "User session is no longer valid" });
      return;
    }

    request.currentUser = user;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (request.currentUser?.role !== "admin") {
    response.status(403).json({ message: "Administrator access required" });
    return;
  }
  next();
};
