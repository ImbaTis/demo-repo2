# Lead CRM

A small CRM for recording leads and tracking how they move through your pipeline.

Built with Next.js (App Router), Prisma + SQLite, Tailwind CSS and zod.

## Getting started

```bash
npm install
npm run setup   # creates .env, applies migrations, seeds sample leads
npm run dev     # http://localhost:3000
```

## Using the app

- **/leads** — every lead, with search (name, company, email, phone), status and source
  filters, and sorting. Filters live in the URL, so a filtered view can be bookmarked.
- **/leads/new** — add a lead. Name is required; emails must be valid and unique.
- **/leads/:id** — lead detail: move the lead to a new status (with an optional note),
  log notes, calls, emails and meetings, and see the full timeline.
- **/leads/:id/edit** — edit any field. Clearing an optional field removes it.

## API

JSON endpoints backed by the same validation and service layer as the UI.

| Method   | Path                         | Body / query                                                      |
| -------- | ---------------------------- | ----------------------------------------------------------------- |
| `GET`    | `/api/leads`                 | `?q=&status=&source=&sort=` (`newest`, `oldest`, `updated`, `value_desc`, `value_asc`, `name`) |
| `POST`   | `/api/leads`                 | `{ name, company?, email?, phone?, status?, source?, value?, notes? }` |
| `GET`    | `/api/leads/:id`             | Returns the lead with its `activities`                            |
| `PATCH`  | `/api/leads/:id`             | Any lead fields to change, plus optional `statusNote`; `""` clears a field |
| `DELETE` | `/api/leads/:id`             | Deletes the lead and its timeline                                 |
| `POST`   | `/api/leads/:id/activities`  | `{ type: "NOTE" \| "CALL" \| "EMAIL" \| "MEETING", body }`        |

Errors: `400` with `fieldErrors` for invalid input, `404` for an unknown lead, `409` for a
duplicate email.

```bash
curl -X POST localhost:3000/api/leads -H 'content-type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","value":24000}'
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
src/app/leads/         Pages and server actions for the UI
src/app/api/leads/     REST API route handlers
src/components/        Lead form, filter bar, status badge and detail-page controls
tests/                 Vitest suites
```
