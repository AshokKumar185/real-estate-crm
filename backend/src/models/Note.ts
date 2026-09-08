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
import { User } from "./User.js";

export class Note extends Model<
  InferAttributes<Note>,
  InferCreationAttributes<Note>
> {
  declare id: CreationOptional<string>;
  declare leadId: ForeignKey<Lead["id"]>;
  declare authorId: ForeignKey<User["id"]>;
  declare content: string;
  declare followUpDate: Date | null;
}

Note.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    leadId: { type: DataTypes.UUID, allowNull: false },
    authorId: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    followUpDate: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: "notes", underscored: true },
);
