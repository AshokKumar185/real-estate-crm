import { Sequelize } from "sequelize";
import { logger } from "./logger.js";

const databaseUrl = process.env.DATABASE_URL;

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging:
        process.env.LOG_SQL === "true"
          ? (message) => logger.debug(message)
          : false,
    })
  : new Sequelize(
      process.env.PGDATABASE ?? "real_estate_crm",
      process.env.PGUSER ?? "postgres",
      process.env.PGPASSWORD ?? "postgres",
      {
        dialect: "postgres",
        host: process.env.PGHOST ?? "localhost",
        port: Number(process.env.PGPORT ?? 5432),
        logging:
          process.env.LOG_SQL === "true"
            ? (message) => logger.debug(message)
            : false,
      },
    );
