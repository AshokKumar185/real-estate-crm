import { Building, Lead, Project, Unit, User } from "../models/index.js";
import { hashPassword } from "../services/auth.service.js";

export const seedData = async () => {
  const passwordHash = await hashPassword("Password123!");
  const [admin] = await User.findOrCreate({
    where: { email: "admin@estateflow.local" },
    defaults: {
      name: "Aarav Mehta",
      email: "admin@estateflow.local",
      passwordHash,
      role: "admin",
    },
  });
  const [sales] = await User.findOrCreate({
    where: { email: "sales@estateflow.local" },
    defaults: {
      name: "Riya Kapoor",
      email: "sales@estateflow.local",
      passwordHash,
      role: "sales",
    },
  });

  const [project] = await Project.findOrCreate({
    where: { name: "Verdant Heights" },
    defaults: {
      name: "Verdant Heights",
      location: "Whitefield, Bengaluru",
      description:
        "A residential community with landscaped courtyards and club amenities.",
    },
  });
  const [building] = await Building.findOrCreate({
    where: { projectId: project.id, name: "Tower A" },
    defaults: { projectId: project.id, name: "Tower A", totalFloors: 18 },
  });

  for (const unit of [
    { unitNumber: "A-1204", type: "3 BHK", price: 12800000 },
    { unitNumber: "A-1502", type: "2 BHK", price: 9400000 },
    { unitNumber: "A-1701", type: "4 BHK", price: 17200000 },
  ]) {
    await Unit.findOrCreate({
      where: { buildingId: building.id, unitNumber: unit.unitNumber },
      defaults: { ...unit, buildingId: building.id, status: "available" },
    });
  }

  await Lead.findOrCreate({
    where: { phone: "+91 98765 43210" },
    defaults: {
      name: "Neha Sharma",
      phone: "+91 98765 43210",
      email: "neha@example.com",
      stage: "site_visit",
      followUpDate: new Date(Date.now() + 86400000),
      assignedToId: sales.id,
    },
  });
  await Lead.findOrCreate({
    where: { phone: "+91 99887 66554" },
    defaults: {
      name: "Kabir Nair",
      phone: "+91 99887 66554",
      email: "kabir@example.com",
      stage: "negotiation",
      followUpDate: new Date(Date.now() + 172800000),
      assignedToId: sales.id,
    },
  });

  return { adminEmail: admin.email, salesEmail: sales.email };
};
