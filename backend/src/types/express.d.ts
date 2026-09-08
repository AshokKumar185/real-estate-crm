import type { User } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      currentUser?: Pick<User, "id" | "role" | "email" | "name">;
    }
  }
}

export {};
