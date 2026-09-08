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
        followUpDate: { [Op.lte]: new Date(Date.now() + 7 * 86400000) },
      },
    }),
    Unit.count({ where: { status: "available" } }),
    Unit.count({ where: { status: "booked" } }),
    Booking.count({ where: { status: "confirmed" } }),
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
    where: { status: "confirmed" },
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
