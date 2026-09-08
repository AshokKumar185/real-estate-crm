import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./User.js";

export type LeadStage =
  | "new"
  | "contacted"
  | "site_visit"
  | "interested"
  | "negotiation"
  | "booked"
  | "lost";

export class Lead extends Model<
  InferAttributes<Lead>,
  InferCreationAttributes<Lead>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string | null;
  declare phone: string;
  declare stage: LeadStage;
  declare followUpDate: Date | null;
  declare assignedToId: ForeignKey<User["id"]> | null;
}

Lead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(140), allowNull: false },
    email: {
      type: DataTypes.STRING(160),
      allowNull: true,
      validate: { isEmail: true },
    },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    stage: {
      type: DataTypes.ENUM(
        "new",
        "contacted",
        "site_visit",
        "interested",
        "negotiation",
        "booked",
        "lost",
      ),
      allowNull: false,
      defaultValue: "new",
    },
    followUpDate: { type: DataTypes.DATE, allowNull: true },
    assignedToId: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: "leads", underscored: true },
);
