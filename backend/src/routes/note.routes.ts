import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Lead, Note } from "../models/index.js";

const noteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  followUpDate: z.coerce.date().nullable().optional(),
});

export const noteRouter = Router();

noteRouter.post(
  "/leads/:leadId/notes",
  requireAuth,
  async (request, response) => {
    const parsed = noteSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        message: "Invalid note details",
        issues: parsed.error.flatten(),
      });
      return;
    }

    const lead = await Lead.findByPk(request.params.leadId as string);
    if (
      !lead ||
      (request.currentUser?.role === "sales" &&
        lead.assignedToId !== request.currentUser.id)
    ) {
      response.status(404).json({ message: "Lead not found" });
      return;
    }

    const note = await Note.create({
      leadId: lead.id,
      authorId: request.currentUser!.id,
      content: parsed.data.content,
      followUpDate: parsed.data.followUpDate ?? null,
    });
    if (parsed.data.followUpDate !== undefined) {
      await lead.update({ followUpDate: parsed.data.followUpDate });
    }
    response.status(201).json(note);
  },
);

noteRouter.get(
  "/leads/:leadId/notes",
  requireAuth,
  async (request, response) => {
    const lead = await Lead.findByPk(request.params.leadId as string);
    if (
      !lead ||
      (request.currentUser?.role === "sales" &&
        lead.assignedToId !== request.currentUser.id)
    ) {
      response.status(404).json({ message: "Lead not found" });
      return;
    }
    response.json(
      await Note.findAll({
        where: { leadId: lead.id },
        order: [["createdAt", "DESC"]],
      }),
    );
  },
);
