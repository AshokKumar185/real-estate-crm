# EstateFlow API

Express, TypeScript, Sequelize, and PostgreSQL API for the Real Estate CRM.

## Setup

```powershell
pnpm install
Copy-Item .env.example .env
# Set the PostgreSQL password and JWT_SECRET in .env
pnpm seed
pnpm dev
```

The API runs on `http://localhost:4000` by default.

For a first deployment, you can set `SEED_ON_START=true` in `.env`. The server
will create the demo users and sample data only when the database has no users,
then skip seeding on later restarts. Set it back to `false` after initialization
if you do not want startup seeding enabled.

## API overview

- `POST /api/auth/login` authenticates an Admin or Sales Employee.
- `GET|POST|PATCH /api/leads` manages leads and assignment/stage data.
- `GET|POST /api/leads/:leadId/notes` manages lead notes and follow-ups.
- `GET|POST /api/properties` reads projects, buildings, and units.
- `POST /api/properties/projects` creates a project (Admin).
- `POST /api/properties/buildings` creates a building (Admin).
- `POST /api/properties/units` creates a unit (Admin).
- `GET|POST /api/bookings` lists or creates bookings.
- `PATCH /api/bookings/:id/cancel` cancels a confirmed booking.
- `GET /api/dashboard/summary` returns CRM metrics.
- `GET|POST /api/users` manages users (Admin).

Protected endpoints use `Authorization: Bearer <token>`.

## Business rules

- Sales Employees can access only their assigned leads and their own bookings.
- Admins can manage users and property inventory.
- Booking creation locks the unit row inside a transaction and requires `available` status.
- A partial unique index prevents more than one confirmed booking for a unit.
- Cancelling a booking returns the unit to `available` and moves a booked lead back to negotiation.
- `sequelize.sync()` creates the local development schema; production deployments should use reviewed migrations.
