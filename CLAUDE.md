# Sainteté — Project CLAUDE.md

## What this is

A PWA for spiritual accompaniment between a godfather and his godchildren (filleuls). The godfather curates content via an admin panel. Each godchild gets a private URL — no login.

Design spec: `docs/superpowers/specs/2026-04-11-saintete-design.md`

---

## Commands

```bash
npm run dev    # Start dev server (Next.js + Payload CMS) on localhost:3000
npm run build  # Production build
npm test       # Jest (tests in __tests__/)
npm run lint   # ESLint
```

## Required env vars

| Variable | Source |
|---|---|
| `DATABASE_URI` | Neon Postgres connection string |
| `PAYLOAD_SECRET` | Random secret — generate with `openssl rand -hex 32` |
| `VAPID_SUBJECT` | `mailto:your@email.com` |
| `VAPID_PUBLIC_KEY` | Generate with `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Same command above |

---

## Stack

- **Next.js 15 App Router** + **Payload CMS v3** — single Vercel deployment, no separate CMS server
- **Neon Postgres** — via Vercel integration
- **Vercel Blob** — audio files, saint images
- **`@ducanh2912/next-pwa`** — service worker, manifest, Web Push

## Auth model

No login. Token in URL: `/[slug]/[token]`. Validated in Next.js middleware. Invalid token → 404.
Token generated via `crypto.randomBytes(12).toString('hex')` in Payload `beforeChange` hook.

---

## Data model (6 Payload collections)

| Collection | Key fields |
|---|---|
| Godchildren | name, slug, token, patron_saint, theme_color, active, allowed_sources[], push_subscription |
| Saints | name, slug, feast_day (MM-DD), description, image, prayers[] |
| Prayers | title, content, category (base/chapelet/angelus/intercession/litanie), tags, audio |
| Mysteries | name, mystery_type, order (1–5), fruit, introduction, days[], readings[] component, audio_meditation |
| Briques | title, content, type (text/audio), audio_file, target (godchild or null=all), scheduled_date, published |
| Feedback | brique, godchild, reaction (🙏❤️✝️), message, read_at |

### Readings on Mysteries
Each reading has `source_key` (e.g. `"st-luc"`) and `source_label`. At render time, filter to `godchild.allowed_sources`. Managed manually in admin — no defaults.

---

## Key files

| File | Role |
|---|---|
| `middleware.ts` | Edge token check (length only — no DB) |
| `app/(app)/[slug]/[token]/layout.tsx` | Full DB validation (Node runtime) |
| `payload.config.ts` | CMS config — all 6 collections registered here |
| `lib/auth.ts` | `resolveGodchild()` — triple-condition DB lookup |
| `lib/push.ts` | Web Push sender — requires VAPID env vars |

---

## URL structure

Routes live under `app/(app)/` route group. URLs remain:

```
/[slug]/[token]              Dashboard — app/(app)/[slug]/[token]/page.tsx
/[slug]/[token]/chapelet     Rosary
/[slug]/[token]/prieres      Prayer library
/[slug]/[token]/saint        Patron saint
/[slug]/[token]/briques      All briques archive
/admin                       Payload admin (app/(payload)/)
```

## Middleware gotcha

`middleware.ts` runs on **edge runtime** — no Node, no Payload local API. It only checks `token.length >= 16`. Full godchild DB lookup is in `app/(app)/[slug]/[token]/layout.tsx` (Node runtime). Never add DB calls to middleware.

---

## Key UX rules

- **Dashboard**: latest brique fills the top (big, readable). Reaction strip (🙏❤️✝️) below it. Navigation grid (Chapelet / Prières / Saint Patron) below that.
- **Chapelet picker**: list of 4 mystery types. Today's mystery highlighted in accent color (computed from `days[]` vs current weekday). User can pick any.
- **Chapelet detail**: intro text → 5 accordions. Each accordion: mystery name + fruit. Expanded: reading picker filtered by `allowed_sources`. Progress saved to localStorage only — no DB writes for reading state.
- **Dark mode by default.** Liturgical accent color per godchild (`theme_color`).
- No infinite scroll, no engagement mechanics, no distractions.

---

## Content source

`recueil.md` is the source of truth for all prayer and rosary content. It maps to:
- Prières du Chrétien → Prayers (category: base)
- Chapelet (4 mystery types, 20 mysteries, per-mystery intro texts) → Mysteries
- La Prière de Jésus → Prayers (category: base)

Content is seeded manually into Payload admin. No import script.

---

## Design constraints

- Serif font for prayer content, sans-serif for UI chrome
- Liturgical colors: violet (Avent/Carême), blanc (fêtes), vert (ordinaire), rouge (martyrs), or (solennités)
- PWA installable via "Add to Home Screen" — walk godchildren through it manually the first time
- Web Push requires iOS 16.4+ on iPhone

---

## Future (not in MVP)

- Magic-link auth for open registration (~1 year out)
- Liturgical calendar API sync
- Self-serve godchild onboarding

Do not design for these now.
