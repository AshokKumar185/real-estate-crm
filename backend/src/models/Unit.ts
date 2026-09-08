import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database.js";
import { Building } from "./Building.js";

export class Unit extends Model<
  InferAttributes<Unit>,
  InferCreationAttributes<Unit>
> {
  declare id: CreationOptional<string>;
  declare buildingId: ForeignKey<Building["id"]>;
  declare unitNumber: string;
  declare type: string;
  declare price: number;
  declare status: "available" | "blocked" | "booked";
}

Unit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buildingId: { type: DataTypes.UUID, allowNull: false },
    unitNumber: { type: DataTypes.STRING(40), allowNull: false },
    type: { type: DataTypes.STRING(80), allowNull: false },
    price: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("available", "blocked", "booked"),
      allowNull: false,
      defaultValue: "available",
    },
  },
  {
    sequelize,
    tableName: "units",
    underscored: true,
    indexes: [{ unique: true, fields: ["building_id", "unit_number"] }],
  },
);
