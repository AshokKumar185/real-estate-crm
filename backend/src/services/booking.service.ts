import { Transaction, UniqueConstraintError } from "sequelize";
import { sequelize } from "../config/database.js";
import { Booking, Lead, Unit } from "../models/index.js";

export class BookingConflictError extends Error {
  constructor(message = "This unit is no longer available") {
    super(message);
    this.name = "BookingConflictError";
  }
}

export class BookingPermissionError extends Error {
  constructor(message = "You can only book your assigned leads") {
    super(message);
    this.name = "BookingPermissionError";
  }
}

export type CreateBookingInput = {
  leadId: string;
  unitId: string;
  bookedById: string;
  isAdmin: boolean;
};

export const createBooking = async (input: CreateBookingInput) => {
  try {
    return await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
      async (transaction) => {
        const [lead, unit] = await Promise.all([
          Lead.findByPk(input.leadId, { transaction }),
          Unit.findByPk(input.unitId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          }),
        ]);

        if (!lead) {
          throw new Error("Lead not found");
        }
        if (!input.isAdmin && lead.assignedToId !== input.bookedById) {
          throw new BookingPermissionError();
        }
        if (!unit) {
          throw new Error("Unit not found");
        }
        if (unit.status !== "available") {
          throw new BookingConflictError();
        }

        const booking = await Booking.create(
          {
            leadId: lead.id,
            unitId: unit.id,
            bookedById: input.bookedById,
            status: "confirmed",
          },
          { transaction },
        );

        await unit.update({ status: "booked" }, { transaction });
        await lead.update({ stage: "booked" }, { transaction });

        return booking;
      },
    );
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new BookingConflictError();
    }
    throw error;
  }
};

export const cancelBooking = async (
  bookingId: string,
  userId: string,
  isAdmin: boolean,
) => {
  return sequelize.transaction(async (transaction) => {
    const booking = await Booking.findByPk(bookingId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!booking || booking.status !== "confirmed") return null;
    if (!isAdmin && booking.bookedById !== userId)
      throw new BookingConflictError("You cannot cancel this booking");

    const unit = await Unit.findByPk(booking.unitId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    await booking.update({ status: "cancelled" }, { transaction });
    if (unit?.status === "booked")
      await unit.update({ status: "available" }, { transaction });
    await Lead.update(
      { stage: "negotiation" },
      { where: { id: booking.leadId, stage: "booked" }, transaction },
    );
    return booking;
  });
};
