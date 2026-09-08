import { Booking } from "./Booking.js";
import { Building } from "./Building.js";
import { Lead } from "./Lead.js";
import { Note } from "./Note.js";
import { Project } from "./Project.js";
import { Unit } from "./Unit.js";
import { User } from "./User.js";

Project.hasMany(Building, {
  foreignKey: "projectId",
  as: "buildings",
  onDelete: "CASCADE",
});
Building.belongsTo(Project, { foreignKey: "projectId", as: "project" });

Building.hasMany(Unit, {
  foreignKey: "buildingId",
  as: "units",
  onDelete: "CASCADE",
});
Unit.belongsTo(Building, { foreignKey: "buildingId", as: "building" });

User.hasMany(Lead, { foreignKey: "assignedToId", as: "assignedLeads" });
Lead.belongsTo(User, { foreignKey: "assignedToId", as: "assignedEmployee" });

Lead.hasMany(Note, { foreignKey: "leadId", as: "notes", onDelete: "CASCADE" });
Note.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });
User.hasMany(Note, { foreignKey: "authorId", as: "notesAuthored" });
Note.belongsTo(User, { foreignKey: "authorId", as: "author" });

Lead.hasMany(Booking, { foreignKey: "leadId", as: "bookings" });
Booking.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });
Unit.hasMany(Booking, { foreignKey: "unitId", as: "bookings" });
Booking.belongsTo(Unit, { foreignKey: "unitId", as: "unit" });
User.hasMany(Booking, { foreignKey: "bookedById", as: "bookingsCreated" });
Booking.belongsTo(User, { foreignKey: "bookedById", as: "bookedBy" });

export { Booking, Building, Lead, Note, Project, Unit, User };
