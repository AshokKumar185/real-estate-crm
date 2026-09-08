import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { User } from "../models/index.js";
import { hashPassword } from "../services/auth.service.js";

const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "sales"]),
});

export const userRouter = Router();

userRouter.get("/", requireAuth, requireAdmin, async (_request, response) => {
  response.json(
    await User.findAll({
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
    }),
  );
});

userRouter.post("/", requireAuth, requireAdmin, async (request, response) => {
  const parsed = userSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Invalid user details",
      issues: parsed.error.flatten(),
    });
    return;
  }
  const existing = await User.findOne({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    response
      .status(409)
      .json({ message: "A user with this email already exists" });
    return;
  }
  const user = await User.create({
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await hashPassword(parsed.data.password),
  });
  response
    .status(201)
    .json({ id: user.id, name: user.name, email: user.email, role: user.role });
});
