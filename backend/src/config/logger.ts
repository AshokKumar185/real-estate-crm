import fs from "node:fs";
import path from "node:path";
import winston from "winston";

const logsDirectory = path.resolve(process.cwd(), "logs");
fs.mkdirSync(logsDirectory, { recursive: true });

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const details =
      Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : "";
    return `${timestamp} ${level}: ${message}${details}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  defaultMeta: { service: "real-estate-crm-api" },
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "combined.log"),
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "exceptions.log"),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "rejections.log"),
      format: fileFormat,
    }),
  ],
});
