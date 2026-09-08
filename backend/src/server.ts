import "dotenv/config";
import express from "express";
import cors from "cors";
import type { ErrorRequestHandler } from "express";
import { sequelize } from "./config/database.js";
import { logger } from "./config/logger.js";
import "./models/index.js";
import { authRouter } from "./routes/auth.routes.js";
import { bookingRouter } from "./routes/booking.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { leadRouter } from "./routes/lead.routes.js";
import { propertyRouter } from "./routes/property.routes.js";
import { noteRouter } from "./routes/note.routes.js";
import { unitRouter } from "./routes/unit.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { User } from "./models/index.js";
import { seedData } from "./scripts/seed-data.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use((request, response, next) => {
  const startedAt = Date.now();

  response.on("finish", () => {
    const level =
      response.statusCode >= 500
        ? "error"
        : response.statusCode >= 400
          ? "warn"
          : "http";
    logger.log(level, "HTTP request completed", {
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/leads", leadRouter);
app.use("/api/units", unitRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", noteRouter);
app.use("/api/users", userRouter);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "real-estate-crm-api" });
});

const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  logger.error("Unhandled request error", {
    method: request.method,
    path: request.originalUrl,
    error:
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
  });

  if (response.headersSent) {
    return;
  }

  response.status(500).json({ message: "An unexpected server error occurred" });
};

app.use(errorHandler);

const start = async () => {
  await sequelize.authenticate();
  logger.info("Database connection established");
  await sequelize.sync();
  logger.info("Database schema synchronized");
  if (process.env.SEED_ON_START === "true") {
    const userCount = await User.count();
    if (userCount === 0) {
      const result = await seedData();
      logger.info("Initial seed data created", result);
    } else {
      logger.info("Initial seed skipped because users already exist");
    }
  }
  const server = app.listen(port, () => {
    logger.info("API listening", {
      port,
      environment: process.env.NODE_ENV ?? "development",
    });
  });

  const shutdown = async (signal: string) => {
    logger.info("Shutdown requested", { signal });
    server.close(async () => {
      await sequelize.close();
      logger.info("API shutdown complete");
      process.exit(0);
    });
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
};

start().catch((error: unknown) => {
  logger.error("Unable to start API", { error });
  process.exit(1);
});
