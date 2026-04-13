# Getting started

## Prerequisites

- Node.js 20+
- A Postgres database (Neon works locally too — grab a free branch, or use a local `pg` instance)

## 1. Clone and install

```bash
git clone https://github.com/Dorianhgn/app_saintete.git
cd app_saintete
npm install
```

## 2. Environment variables

Copy the example and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URI` | Postgres connection string, e.g. `postgresql://user:pass@host/db` |
| `PAYLOAD_SECRET` | Any long random string — used to sign Payload sessions |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for Web Push |
| `VAPID_PRIVATE_KEY` | VAPID private key |
| `VAPID_SUBJECT` | `mailto:you@example.com` |

### Generate VAPID keys (one-time)

```bash
npx web-push generate-vapid-keys
```

Copy the output into `.env.local`.

!!! note
    There is no `.env.example` committed yet. The variables above are the full list — create the file manually.

## 3. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`. Payload admin at `http://localhost:3000/admin`.

### First-time admin setup

On first run, Payload will prompt you to create an admin user at `/admin/create-first-user`.

## 4. Run tests

```bash
npm test
```

14 tests across `lib/auth.ts`, `lib/mystery-of-day.ts`, and `components/MysteryAccordion`.

## 5. Type generation

If you modify any Payload collection schema, regenerate types:

```bash
npx payload generate:types
```

This overwrites `payload-types.ts` at the repo root.
