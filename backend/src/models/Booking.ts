import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database.js";
import { Lead } from "./Lead.js";
import { Unit } from "./Unit.js";
import { User } from "./User.js";

export class Booking extends Model<
  InferAttributes<Booking>,
  InferCreationAttributes<Booking>
> {
  declare id: CreationOptional<string>;
  declare leadId: ForeignKey<Lead["id"]>;
  declare unitId: ForeignKey<Unit["id"]>;
  declare bookedById: ForeignKey<User["id"]>;
  declare status: "confirmed" | "cancelled";
  declare bookedAt: CreationOptional<Date>;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    leadId: { type: DataTypes.UUID, allowNull: false },
    unitId: { type: DataTypes.UUID, allowNull: false },
    bookedById: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM("confirmed", "cancelled"),
      allowNull: false,
      defaultValue: "confirmed",
    },
    bookedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "bookings",
    underscored: true,
    indexes: [
      { unique: true, fields: ["unit_id"], where: { status: "confirmed" } },
    ],
  },
);
