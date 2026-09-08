# EstateFlow Real Estate CRM

EstateFlow is a small full-stack CRM for real estate sales teams. It provides lead management, property inventory, bookings, follow-ups, notes, role-based access, and a sales dashboard.

## Features

- Create, search, filter, view, and edit leads
- Lead stages: New, Contacted, Site Visit, Interested, Negotiation, Booked, and Lost
- Assign leads to sales employees
- Add notes and follow-up dates to leads
- Manage projects, buildings, and units
- Track unit type, price, and availability
- Create bookings from a lead to an available unit
- Prevent duplicate confirmed bookings for the same unit
- Dashboard metrics for leads, follow-ups, inventory, and bookings
- Admin and Sales Employee authentication
- Loading, empty, validation, and error states in the frontend

## Technology

- Frontend: Next.js, React, TypeScript, and Lucide React
- Backend: Express, TypeScript, Sequelize, Zod, and JWT
- Database: PostgreSQL
- Package manager: pnpm

## Project structure

```text
backend/   Express API, Sequelize models, authentication, business logic, and seed data
frontend/  Next.js application and reusable CRM UI components
```

## Prerequisites

- Node.js 20 or newer
- pnpm
- PostgreSQL running locally or a reachable PostgreSQL instance

## Setup

### 1. Install dependencies

Open two terminals from the repository root:

```powershell
cd backend
pnpm install

cd ..\frontend
pnpm install
```

### 2. Configure PostgreSQL and the API

Create a PostgreSQL database matching the values in `backend/.env.example`, or use a hosted PostgreSQL connection string in `DATABASE_URL`.

```powershell
cd backend
Copy-Item .env.example .env
```

Update `backend/.env` with a long random `JWT_SECRET`.

For local development with pgAdmin, leave `DATABASE_URL` empty and configure the `PG*` variables:

```env
DATABASE_URL=
PGHOST=localhost
PGPORT=5433
PGDATABASE=real_estate_crm
PGUSER=postgres
PGPASSWORD=your-local-password
```

For production with Neon, set `DATABASE_URL` to the Neon connection string in your hosting provider's secret/environment-variable settings. Do not commit the connection string or database password to GitHub:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

When `DATABASE_URL` is set, it takes precedence over the individual `PG*` variables. Neon URLs with `sslmode=require` are supported by the backend.

The default API configuration is:

- API: `http://localhost:4000`
- PostgreSQL host: `localhost`
- PostgreSQL port: `5433`
- Database: `real_estate_crm`

If PostgreSQL uses the usual port `5432`, change `PGPORT` in `backend/.env`.

### 3. Seed the database

```powershell
cd backend
pnpm seed
```

The seed command creates the development schema, demo users, a project, a building, units, and sample leads.

For a first production deployment, set `SEED_ON_START=true` in the backend environment. The server will seed only when the database has no users, then skip seeding on later restarts. After the first successful deployment, set `SEED_ON_START=false` or remove it.

Never use a production database password in a committed `.env` file. Rotate the Neon password if it has been shared publicly.

### 4. Start the applications

Terminal 1:

```powershell
cd backend
pnpm dev
```

Terminal 2:

```powershell
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend uses `http://localhost:4000/api` by default. To use another API URL, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Demo accounts

Both seeded accounts use the password `Password123!`.

| Role           | Email                    |
| -------------- | ------------------------ |
| Admin          | `admin@estateflow.local` |
| Sales Employee | `sales@estateflow.local` |

## Permissions

### Admin

- View all leads, bookings, properties, and dashboard data
- Create and assign leads
- Manage projects, buildings, and units
- Manage users through the API
- Cancel confirmed bookings

### Sales Employee

- View assigned leads and their own bookings
- Create leads, which are assigned to the logged-in employee
- Edit assigned leads and add notes/follow-ups
- View property inventory
- Create bookings for available units associated with their assigned leads
- Cancel bookings created by that employee

Lead, property, user, and booking-list permissions are enforced by the backend, not only by frontend visibility. Booking creation should additionally validate that a Sales Employee is booking an assigned lead before production use.

## Database overview

```text
User
  |-- assigned leads --> Lead
  |-- authored notes --> Note
  |-- created bookings -> Booking

Project
  |-- has many --> Building
                   |-- has many --> Unit

Lead
  |-- has many --> Note
  |-- has many --> Booking

Booking
  |-- belongs to --> Lead
  |-- belongs to --> Unit
  |-- belongs to --> User
```

Important fields include:

- `User.role`: `admin` or `sales`
- `Lead.stage`: `new`, `contacted`, `site_visit`, `interested`, `negotiation`, `booked`, or `lost`
- `Unit.status`: `available`, `blocked`, or `booked`
- `Booking.status`: `confirmed` or `cancelled`

The development server uses `sequelize.sync()` to create the local schema. Production deployments should use reviewed migrations instead.

## API overview

All protected endpoints require:

```text
Authorization: Bearer <jwt>
```

| Method | Endpoint                           | Purpose                                             |
| ------ | ---------------------------------- | --------------------------------------------------- |
| POST   | `/api/auth/login`                  | Authenticate an Admin or Sales Employee             |
| GET    | `/api/leads`                       | List leads; supports `search` and role filtering    |
| POST   | `/api/leads`                       | Create a lead                                       |
| GET    | `/api/leads/:id`                   | View a lead and its notes                           |
| PATCH  | `/api/leads/:id`                   | Edit lead details, stage, assignment, and follow-up |
| GET    | `/api/leads/:leadId/notes`         | List notes for a lead                               |
| POST   | `/api/leads/:leadId/notes`         | Add a note and optional follow-up date              |
| GET    | `/api/properties`                  | Read projects, buildings, and units                 |
| POST   | `/api/properties/projects`         | Create a project; Admin only                        |
| POST   | `/api/properties/buildings`        | Create a building; Admin only                       |
| POST   | `/api/properties/units`            | Create a unit; Admin only                           |
| PATCH  | `/api/properties/units/:id/status` | Block or release a unit; Admin only                 |
| GET    | `/api/bookings`                    | List bookings with role filtering                   |
| POST   | `/api/bookings`                    | Create a booking for an available unit              |
| PATCH  | `/api/bookings/:id/cancel`         | Cancel a confirmed booking                          |
| GET    | `/api/dashboard/summary`           | Return dashboard metrics and recent bookings        |
| GET    | `/api/users`                       | List users; Admin only                              |
| POST   | `/api/users`                       | Create a user; Admin only                           |
| GET    | `/api/health`                      | Check API availability                              |

## Business and engineering decisions

1. **Booking consistency is enforced in the backend.** Booking creation locks the unit row inside a database transaction, checks that it is available, updates the unit and lead atomically, and uses a partial unique index to prevent two confirmed bookings for one unit.

2. **Permissions are enforced server-side.** The frontend hides unavailable actions for usability, but route middleware and ownership checks remain the source of truth for access control.

3. **Lead activity is modeled separately from lead data.** Notes have their own records and optional follow-up dates, which keeps the lead profile concise while preserving an activity history.

4. **The inventory hierarchy follows the business domain.** Projects contain buildings and buildings contain units, making availability and pricing easy to represent and query.

5. **The project keeps the development setup lightweight.** Sequelize synchronization and seed data make the assignment easy to run locally; production should replace synchronization with migrations and managed infrastructure.

## Validation and quality checks

Run these commands before submitting:

```powershell
cd backend
pnpm run typecheck
pnpm run build

cd ..\frontend
pnpm run lint
pnpm run build
```

## Screenshots or deployment

Add screenshots or a deployed URL here before submission. Recommended screenshots:

- Login screen
- Dashboard
- Lead list with search and stage filter
- Lead detail with edit form and notes
- Property inventory
- Booking creation flow
- Admin and Sales Employee views

## Known development limitations

- The local development schema is created with `sequelize.sync()` rather than migrations.
- The frontend and API are started separately during local development.
- Booking creation should add an explicit assigned-lead ownership check for Sales Employees before production use.
- A production deployment should use managed PostgreSQL, secure environment variables, migrations, and HTTPS.
