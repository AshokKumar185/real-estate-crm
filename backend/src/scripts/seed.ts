import "dotenv/config";
import { sequelize } from "../config/database.js";
import "../models/index.js";
import { seedData } from "./seed-data.js";

const seed = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  const result = await seedData();
  console.log(`Seeded ${result.adminEmail} and ${result.salesEmail}`);
};

seed()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
