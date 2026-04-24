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

## Quick migration

Use this when you change a Payload collection or field.

```bash
npx payload migrate:create
npx payload migrate
```

Commit the generated `migrations/` folder. On Vercel, the production build should run `payload migrate && next build` so schema changes are applied before the app is compiled.

## Docs

Full documentation at **[dorianhgn.github.io/app_saintete](https://dorianhgn.github.io/app_saintete)**

- [Getting started](https://dorianhgn.github.io/app_saintete/getting-started/) — env vars, DB, dev server
- [Architecture](https://dorianhgn.github.io/app_saintete/architecture/) — stack, auth model, URL structure
- [Data model](https://dorianhgn.github.io/app_saintete/data-model/) — 6 Payload collections
- [Content management](https://dorianhgn.github.io/app_saintete/content-management/) — Payload admin guide
- [Deployment](https://dorianhgn.github.io/app_saintete/deployment/) — Vercel + Neon setup
