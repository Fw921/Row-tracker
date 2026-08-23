# Row Tracker

A rowing performance analytics platform: log erg pieces and workouts,
track improvement over time, compare pacing strategies, and (eventually)
predict 2k performance from training data.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Recharts,
Prisma + PostgreSQL (targets Supabase in production), Zod for validation,
Vitest for tests.

## Status: single-user MVP

There's no authentication yet — every workout is attributed to one
seeded account (`DEFAULT_USER_EMAIL`). The data model is already keyed
by `userId` throughout, so adding real accounts later is additive, not a
rewrite. See [Roadmap](#roadmap) below.

## Features

- **Log a workout** — manual entry for date, type, distance, time, avg/max
  heart rate, watts, stroke rate, drag factor, notes, and optional
  per-interval splits (for pacing charts).
- **Import from Concept2 Logbook** — upload a season CSV export from
  [log.concept2.com](https://log.concept2.com) and each row becomes a
  workout. The parser is tolerant of header spacing/casing variations and
  reports which rows it had to skip and why. Note: Concept2's bulk export
  doesn't include per-500m splits, so imported pieces won't have a pacing
  breakdown unless you add splits by hand afterward.
- **History** — filterable/sortable table of everything logged, by anyone
  on the roster, with delete.
- **Dashboard** — split-time trend for a chosen distance (2k, 5k, ...),
  heart rate trend, pacing-strategy comparison (splits overlaid across
  your last few pieces at a distance), weekly training volume, and a PR
  card per distance. Scoped to your own pieces — a teammate's team-piece
  result doesn't blend into your trend.
- **Roster & team pieces** — add teammates to a roster, then log one piece
  for the whole boat at once: set the shared distance or time (e.g.
  "everyone rows 2k"), pick who rowed it, and enter each person's result
  in a table — like calling out splits in the erg room. Produces a
  fastest-to-slowest leaderboard for that piece.

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database — either local Postgres for development, or a
  [Supabase](https://supabase.com) project for anything shared/deployed.

### Setup

```bash
npm install                 # also runs `prisma generate` via postinstall
cp .env.example .env        # then fill in DATABASE_URL (and DEFAULT_USER_EMAIL)
npm run db:migrate          # applies prisma/migrations to your database
npm run db:seed             # creates the single seeded user
npm run dev                 # http://localhost:3000
```

### Using Supabase

Point `DATABASE_URL` in `.env` at your Supabase project's Postgres
connection string (Project Settings → Database → Connection string →
URI). Use the "Transaction" pooling mode string if you deploy to a
serverless target like Vercel. Everything else — schema, migrations,
queries — is plain Prisma/Postgres and doesn't depend on any
Supabase-specific API, so local Postgres and Supabase are interchangeable
for this app.

### Scripts

| Command              | Does                                            |
| --------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the dev server                             |
| `npm run build`        | Production build (also type-checks)              |
| `npm test`             | Run the Vitest suite                             |
| `npm run lint`         | ESLint                                           |
| `npm run db:migrate`   | Apply Prisma migrations (`prisma migrate dev`)   |
| `npm run db:seed`      | Seed the single default user                     |

## Data model

- `User` — single row for now; every other table is scoped by `userId`.
- `Workout` — one logged session (a 2k test, a steady state row, an
  interval set, ...), with aggregate totals and derived
  `avgSplitSeconds500m`.
- `Split` — an ordered sub-piece of a workout (e.g. each 500m of a 2k, or
  each interval of a 6x500m), used for the pacing charts.
- `ImportBatch` — one CSV upload, so imported workouts trace back to the
  file they came from.
- `Athlete` — a teammate on the account owner's roster. Not a login, just
  a name to attribute results to.
- `PieceGroup` — one "everybody rows the same piece" event: the shared
  distance or time, with one `Workout` per rower hanging off it (via
  `Workout.pieceGroupId`) for the leaderboard view.

See `prisma/schema.prisma` for the full schema.

## Roadmap

- **2k performance prediction** — a regression model (pandas/scikit-learn,
  likely as a small Python service or a scheduled job that writes
  predictions back to Postgres) trained on logged training volume, recent
  pace/HR trends, and past test pieces.
- **Multi-user auth** — real accounts (e.g. Supabase Auth), replacing the
  single seeded user in `src/lib/current-user.ts`.
- **Detailed split import** — Concept2's per-workout detail export (not
  just the season summary) includes finer-grained splits; wiring that up
  would give imported pieces the same pacing charts manual entries get.
- **Heart-rate time series** — beyond avg/max HR per workout, ingest full
  HR-over-time data (e.g. from a paired chest strap export).
