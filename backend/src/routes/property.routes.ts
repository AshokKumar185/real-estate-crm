import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Building, Project, Unit } from "../models/index.js";

export const propertyRouter = Router();

const projectSchema = z.object({
  name: z.string().trim().min(2),
  location: z.string().trim().min(2),
  description: z.string().nullable().optional(),
});
const buildingSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1),
  totalFloors: z.number().int().positive().nullable().optional(),
});
const unitSchema = z.object({
  buildingId: z.string().uuid(),
  unitNumber: z.string().trim().min(1),
  type: z.string().trim().min(1),
  price: z.number().positive(),
  status: z.enum(["available", "blocked", "booked"]).optional(),
});

propertyRouter.get("/", requireAuth, async (_request, response) => {
  const projects = await Project.findAll({
    include: [
      {
        model: Building,
        as: "buildings",
        include: [{ model: Unit, as: "units" }],
      },
    ],
    order: [["name", "ASC"]],
  });
  response.json(projects);
});

propertyRouter.post("/projects", requireAuth, async (request, response) => {
  if (request.currentUser?.role !== "admin") {
    response.status(403).json({ message: "Administrator access required" });
    return;
  }
  const parsed = projectSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Invalid project details",
      issues: parsed.error.flatten(),
    });
    return;
  }
  response.status(201).json(
    await Project.create({
      name: parsed.data.name,
      location: parsed.data.location,
      description: parsed.data.description ?? null,
    }),
  );
});

propertyRouter.post("/buildings", requireAuth, async (request, response) => {
  if (request.currentUser?.role !== "admin") {
    response.status(403).json({ message: "Administrator access required" });
    return;
  }
  const parsed = buildingSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Invalid building details",
      issues: parsed.error.flatten(),
    });
    return;
  }
  const project = await Project.findByPk(parsed.data.projectId);
  if (!project) {
    response.status(404).json({ message: "Project not found" });
    return;
  }
  response.status(201).json(
    await Building.create({
      ...parsed.data,
      totalFloors: parsed.data.totalFloors ?? null,
    }),
  );
});

propertyRouter.post("/units", requireAuth, async (request, response) => {
  if (request.currentUser?.role !== "admin") {
    response.status(403).json({ message: "Administrator access required" });
    return;
  }
  const parsed = unitSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Invalid unit details",
      issues: parsed.error.flatten(),
    });
    return;
  }
  const building = await Building.findByPk(parsed.data.buildingId);
  if (!building) {
    response.status(404).json({ message: "Building not found" });
    return;
  }
  response.status(201).json(
    await Unit.create({
      ...parsed.data,
      status: parsed.data.status ?? "available",
    }),
  );
});

propertyRouter.patch(
  "/units/:id/status",
  requireAuth,
  async (request, response) => {
    if (request.currentUser?.role !== "admin") {
      response.status(403).json({ message: "Administrator access required" });
      return;
    }
    const parsed = z
      .object({ status: z.enum(["available", "blocked"]) })
      .safeParse(request.body);
    if (!parsed.success) {
      response
        .status(400)
        .json({ message: "Only available or blocked status can be set" });
      return;
    }
    const unit = await Unit.findByPk(request.params.id as string);
    if (!unit) {
      response.status(404).json({ message: "Unit not found" });
      return;
    }
    await unit.update({ status: parsed.data.status });
    response.json(unit);
  },
);
