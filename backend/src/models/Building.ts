import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database.js";
import { Project } from "./Project.js";

export class Building extends Model<
  InferAttributes<Building>,
  InferCreationAttributes<Building>
> {
  declare id: CreationOptional<string>;
  declare projectId: ForeignKey<Project["id"]>;
  declare name: string;
  declare totalFloors: number | null;
}

Building.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    totalFloors: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "buildings", underscored: true },
);
