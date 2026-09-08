import { Router } from "express";
import { Op } from "sequelize";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Booking, Lead, Unit } from "../models/index.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, async (request, response) => {
  const leadFilter =
    request.currentUser?.role === "sales"
      ? { assignedToId: request.currentUser.id }
      : {};
  const bookingFilter = {
    status: "confirmed" as const,
    ...(request.currentUser?.role === "sales"
      ? { bookedById: request.currentUser.id }
      : {}),
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextSevenDays = new Date(today);
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  const [
    leadCount,
    followUpCount,
    availableUnits,
    bookedUnits,
    recentBookings,
    stageCounts,
  ] = await Promise.all([
    Lead.count({ where: leadFilter }),
    Lead.count({
      where: {
        ...leadFilter,
        followUpDate: { [Op.gte]: today, [Op.lte]: nextSevenDays },
      },
    }),
    Unit.count({ where: { status: "available" } }),
    Unit.count({ where: { status: "booked" } }),
    Booking.count({ where: bookingFilter }),
    Lead.findAll({
      attributes: [
        "stage",
        [Lead.sequelize!.fn("COUNT", Lead.sequelize!.col("id")), "count"],
      ],
      where: leadFilter,
      group: ["stage"],
      raw: true,
    }),
  ]);

  const recent = await Booking.findAll({
    where: bookingFilter,
    include: [
      { model: Lead, as: "lead", attributes: ["name"] },
      { model: Unit, as: "unit", attributes: ["unitNumber", "type"] },
    ],
    order: [["bookedAt", "DESC"]],
    limit: 5,
  });
  response.json({
    leadCount,
    followUpCount,
    availableUnits,
    bookedUnits,
    bookingCount: recentBookings,
    recentBookings: recent,
    stageCounts,
  });
});
