import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Booking, Lead, Unit, User } from "../models/index.js";
import {
  BookingConflictError,
  BookingPermissionError,
  cancelBooking,
  createBooking,
} from "../services/booking.service.js";

const createBookingSchema = z.object({
  leadId: z.string().uuid(),
  unitId: z.string().uuid(),
});

export const bookingRouter = Router();

bookingRouter.get("/", requireAuth, async (request, response) => {
  const where =
    request.currentUser?.role === "sales"
      ? { bookedById: request.currentUser.id }
      : undefined;
  const bookings = await Booking.findAll({
    where,
    include: [
      { model: Lead, as: "lead", attributes: ["id", "name", "phone"] },
      {
        model: Unit,
        as: "unit",
        attributes: ["id", "unitNumber", "type", "price"],
      },
      { model: User, as: "bookedBy", attributes: ["id", "name"] },
    ],
    order: [["bookedAt", "DESC"]],
  });
  response.json(bookings);
});

bookingRouter.post("/", requireAuth, async (request, response) => {
  const parsed = createBookingSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Invalid booking details",
      issues: parsed.error.flatten(),
    });
    return;
  }

  try {
    const booking = await createBooking({
      ...parsed.data,
      bookedById: request.currentUser!.id,
      isAdmin: request.currentUser!.role === "admin",
    });
    response.status(201).json(booking);
  } catch (error) {
    if (error instanceof BookingConflictError) {
      response.status(409).json({ message: error.message });
      return;
    }
    if (error instanceof BookingPermissionError) {
      response.status(403).json({ message: error.message });
      return;
    }
    if (
      error instanceof Error &&
      ["Lead not found", "Unit not found"].includes(error.message)
    ) {
      response.status(404).json({ message: error.message });
      return;
    }
    response.status(500).json({ message: "Unable to create booking" });
  }
});

bookingRouter.patch("/:id/cancel", requireAuth, async (request, response) => {
  try {
    const booking = await cancelBooking(
      request.params.id as string,
      request.currentUser!.id,
      request.currentUser!.role === "admin",
    );
    if (!booking) {
      response.status(404).json({ message: "Confirmed booking not found" });
      return;
    }
    response.json(booking);
  } catch (error) {
    if (error instanceof BookingConflictError) {
      response.status(403).json({ message: error.message });
      return;
    }
    response.status(500).json({ message: "Unable to cancel booking" });
  }
});
