import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Project extends Model<
  InferAttributes<Project>,
  InferCreationAttributes<Project>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare location: string;
  declare description: string | null;
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(160), allowNull: false },
    location: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "projects", underscored: true },
);
