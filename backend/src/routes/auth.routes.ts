import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../services/auth.service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = Router();

authRouter.post("/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Enter a valid email and password" });
    return;
  }

  const result = await authenticateUser(
    parsed.data.email,
    parsed.data.password,
  );
  if (!result) {
    response.status(401).json({ message: "Invalid email or password" });
    return;
  }

  response.json(result);
});
