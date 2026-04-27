# Sainteté

A private PWA for spiritual accompaniment between a godfather and his godchildren. Each godchild gets a unique private URL — no login required.

**Stack:** Next.js 15 · Payload CMS v3 · Neon Postgres · Vercel · Tailwind CSS · Web Push

---

## Quick start

```bash
git clone https://github.com/Dorianhgn/app_saintete.git
cd app_saintete
npm install
cp .env.example .env.local   # fill in DATABASE_URI, PAYLOAD_SECRET, VAPID keys
npm run dev
```

App: `http://localhost:3000` — Admin: `http://localhost:3000/admin`

## Quick migration (schema changes)

Use this whenever you change a Payload collection, global, or field.

1. Generate migration files from your schema diff:

```bash
npm run migrate:create -- add-short-name
# equivalent: npx payload migrate:create add-short-name
```

2. Apply pending migrations locally:

```bash
npm run migrate
# equivalent: npx payload migrate
```

3. Commit the schema artifacts:
- `migrations/*.ts`
- `migrations/*.json`
- `migrations/index.ts` (if updated)
- `payload-types.ts` (if regenerated)

Why two commands:
- `migrate:create` creates versioned migration files.
- `migrate` applies pending migration files to the database.

Common mistake:
- `npm run payload migrate:refresh` fails in this repo because `migrate:refresh` is not a defined npm script.
- Use `npm run migrate:create -- <name>` and `npm run migrate` instead.

On Vercel, the production build should run `payload migrate && next build` so schema changes are applied before the app is compiled.

## Docs

Full documentation at **[dorianhgn.github.io/app_saintete](https://dorianhgn.github.io/app_saintete)**

- [Getting started](https://dorianhgn.github.io/app_saintete/getting-started/) — env vars, DB, dev server
- [Architecture](https://dorianhgn.github.io/app_saintete/architecture/) — stack, auth model, URL structure
- [Data model](https://dorianhgn.github.io/app_saintete/data-model/) — 6 Payload collections
- [Content management](https://dorianhgn.github.io/app_saintete/content-management/) — Payload admin guide
- [Deployment](https://dorianhgn.github.io/app_saintete/deployment/) — Vercel + Neon setup
