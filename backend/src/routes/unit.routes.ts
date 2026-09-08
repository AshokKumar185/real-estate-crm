import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Unit } from "../models/index.js";

export const unitRouter = Router();

unitRouter.get("/", requireAuth, async (_request, response) => {
  const units = await Unit.findAll({ order: [["unitNumber", "ASC"]] });
  response.json(units);
});
