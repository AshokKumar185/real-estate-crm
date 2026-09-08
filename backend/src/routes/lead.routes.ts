import { Router } from "express";
import { Op } from "sequelize";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Lead, User } from "../models/index.js";

export const leadRouter = Router();

const ensureSalesEmployee = async (assignedToId: string | null | undefined) => {
  if (!assignedToId) return true;
  const user = await User.findOne({
    where: { id: assignedToId, role: "sales" },
    attributes: ["id"],
  });
  return Boolean(user);
};

const leadSchema = z.object({
  name: z.string().min(2).max(140),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(30, "Phone number must be 30 characters or fewer")
    .regex(
      /^\+?[0-9][0-9\s().-]*$/,
      "Phone number contains unsupported characters",
    )
    .refine((value) => {
      const digitCount = (value.match(/\d/g) ?? []).length;
      return digitCount >= 7 && digitCount <= 15;
    }, "Phone number must contain between 7 and 15 digits"),
  email: z.string().email().nullable().optional(),
  stage: z
    .enum([
      "new",
      "contacted",
      "site_visit",
      "interested",
      "negotiation",
      "booked",
      "lost",
    ])
    .optional(),
  followUpDate: z.coerce.date().nullable().optional(),
  assignedToId: z.string().uuid().nullable().optional(),
});

leadRouter.get("/", requireAuth, async (request, response) => {
  const search =
    typeof request.query.search === "string" ? request.query.search.trim() : "";
  const where = {
    ...(search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {}),
    ...(request.currentUser?.role === "sales"
      ? { assignedToId: request.currentUser.id }
      : {}),
  };
  const leads = await Lead.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
  response.json(leads);
});

leadRouter.get("/:id", requireAuth, async (request, response) => {
  const leadId = request.params.id as string;
  const lead = await Lead.findByPk(leadId, {
    include: [{ association: "notes" }],
  });
  if (
    !lead ||
    (request.currentUser?.role === "sales" &&
      lead.assignedToId !== request.currentUser.id)
  ) {
    response.status(404).json({ message: "Lead not found" });
    return;
  }
  response.json(lead);
});

leadRouter.post("/", requireAuth, async (request, response) => {
  const parsed = leadSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Invalid lead details",
      issues: parsed.error.flatten(),
    });
    return;
  }

  const assignedToId =
    request.currentUser?.role === "sales"
      ? request.currentUser.id
      : (parsed.data.assignedToId ?? null);
  if (
    request.currentUser?.role === "admin" &&
    !(await ensureSalesEmployee(assignedToId))
  ) {
    response
      .status(400)
      .json({ message: "Leads can only be assigned to Sales Employees" });
    return;
  }
  const lead = await Lead.create({
    ...parsed.data,
    assignedToId,
    email: parsed.data.email ?? null,
    stage: parsed.data.stage ?? "new",
    followUpDate: parsed.data.followUpDate ?? null,
  });
  response.status(201).json(lead);
});

leadRouter.patch("/:id", requireAuth, async (request, response) => {
  const parsed = leadSchema.partial().safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Invalid lead details",
      issues: parsed.error.flatten(),
    });
    return;
  }

  const leadId = request.params.id as string;
  const lead = await Lead.findByPk(leadId);
  if (
    !lead ||
    (request.currentUser?.role === "sales" &&
      lead.assignedToId !== request.currentUser.id)
  ) {
    response.status(404).json({ message: "Lead not found" });
    return;
  }
  if (
    request.currentUser?.role === "admin" &&
    parsed.data.assignedToId !== undefined &&
    !(await ensureSalesEmployee(parsed.data.assignedToId))
  ) {
    response
      .status(400)
      .json({ message: "Leads can only be assigned to Sales Employees" });
    return;
  }
  const updateData =
    request.currentUser?.role === "sales"
      ? Object.fromEntries(
          Object.entries(parsed.data).filter(([key]) => key !== "assignedToId"),
        )
      : parsed.data;
  await lead.update(updateData);
  response.json(lead);
});
