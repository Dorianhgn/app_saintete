# Deployment

The app deploys as a single Vercel project. Payload admin, Next.js frontend, and API routes all run in the same deployment.

---

## Services

| Service | Role | Setup |
|---|---|---|
| Vercel | Hosting + serverless functions | Connect GitHub repo |
| Neon | Postgres database | Vercel integration or manual |
| Vercel Blob | Audio files, saint images | Vercel integration |

---

## Vercel setup

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add Project** → import `app_saintete`
3. Set the **Root Directory** to `.` (repo root — there is no separate Next.js subfolder)
4. Add environment variables (see below)
5. Deploy

Vercel auto-deploys on push to `main`.

---

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables.

| Variable | Where to get it |
|---|---|
| `DATABASE_URI` | Neon dashboard → Connection string (pooled) |
| `PAYLOAD_SECRET` | Any long random string — generate once, never change |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Run `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Same command as above |
| `VAPID_SUBJECT` | `mailto:your@email.com` |

!!! warning
    `PAYLOAD_SECRET` must be consistent across deployments. Changing it invalidates all admin sessions.

---

## Neon database

1. Create a project at [neon.tech](https://neon.tech)
2. Use the **Vercel integration** for automatic `DATABASE_URI` injection, or copy the connection string manually
3. Use the **pooled** connection string (port 6543) for serverless functions

Payload runs migrations automatically on first boot — no manual `migrate` step needed.

---

## First deploy checklist

- [ ] `DATABASE_URI` set and database reachable
- [ ] `PAYLOAD_SECRET` set
- [ ] VAPID keys set (all three variables)
- [ ] Deployed successfully
- [ ] Visit `/admin/create-first-user` to create the admin account (one-time)
- [ ] Add at least one godchild and verify their URL loads

---

## Custom domain

Set in Vercel → Project → Domains. Godchild URLs use whatever domain you configure there.

---

## GitHub Pages (docs only)

Docs are deployed automatically by the CI workflow (`.github/workflows/docs.yml`) on every push to `main` that touches `docs/` or `mkdocs.yml`. The built site is pushed to the `gh-pages` branch.

Enable GitHub Pages in: repo Settings → Pages → Source: **Deploy from branch** → `gh-pages` / `/ (root)`.

Docs URL: `https://dorianhgn.github.io/app_saintete`
