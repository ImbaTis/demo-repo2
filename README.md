# Lead CRM

A small CRM for recording leads and tracking how they move through your pipeline.

Built with Next.js (App Router), Prisma + SQLite, Tailwind CSS and zod.

## Getting started

```bash
npm install
npm run setup   # creates .env, applies migrations, seeds sample leads
npm run dev     # http://localhost:3000
```

## Scripts

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server                           |
| `npm run build`     | Production build                               |
| `npm test`          | Run the Vitest suite (uses `prisma/test.db`)   |
| `npm run typecheck` | Generate route types and run `tsc`             |
| `npm run lint`      | ESLint                                         |
| `npm run db:seed`   | Reset the dev database to the sample leads     |

## Data model

- **Lead** — name, company, email (unique), phone, status, source, estimated value, notes.
- **Activity** — the lead's timeline: notes, calls, emails, meetings, and status changes
  (logged automatically whenever a lead's status changes).

Statuses: New → Contacted → Qualified → Proposal → Won / Lost.

## Project layout

```
prisma/schema.prisma   Lead + Activity models
prisma/seed.ts         Sample data
src/lib/constants.ts   Statuses, sources, activity types and labels
src/lib/validation.ts  zod schemas shared by forms and the API
src/lib/leads.ts       Lead service: all reads and writes go through here
tests/                 Vitest suites
```
