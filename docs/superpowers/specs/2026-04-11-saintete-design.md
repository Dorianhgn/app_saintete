# Sainteté — Design Spec
_2026-04-11_

## Overview

A Progressive Web App for spiritual accompaniment between a godfather and his godchildren. The godfather curates content (prayers, rosary meditations, "briques" spirituelles) via an admin panel. Each godchild gets a private, personalized URL — no login required.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 App Router | SSR, dynamic routing, PWA-ready |
| CMS | Payload CMS v3 | Runs inside Next.js — single Vercel deployment, no Railway |
| Database | Neon Postgres | Free tier, native Vercel integration |
| File storage | Vercel Blob | Audio topos, saint images |
| Hosting | Vercel | Auto-deploy on git push |
| PWA | `@ducanh2912/next-pwa` | Service worker, manifest, Web Push |

**Single deployment.** No separate CMS server, no Railway bill.

---

## Authentication

No login system. Each godchild has a **secret token** embedded in their URL:

```
saintetee.app/martin/abc123xyz
```

- Token validated server-side on every request (Next.js middleware)
- Invalid or missing token → 404 (not a redirect, to avoid enumeration)
- To revoke access: change the token in Payload admin
- Token should be ~16 chars, URL-safe random string

---

## URL Structure

```
/[slug]/[token]                → Dashboard
/[slug]/[token]/chapelet       → Rosary
/[slug]/[token]/prieres        → Prayer library
/[slug]/[token]/saint          → Patron saint page
/[slug]/[token]/briques        → All briques (archive)
/admin                         → Payload admin (godfather only)
```

---

## Data Model (Payload Collections)

### Godchildren
```
name              text
slug              text              e.g. "martin"
token             text              secret, URL-safe, 16 chars — auto-generated in
                                    Payload beforeChange hook via crypto.randomBytes(12).toString('hex')
                                    shown read-only in admin after creation
patron_saint      relation → Saints
theme_color       select            violet | vert | blanc | rouge | or (liturgical)
active            boolean
allowed_sources   text[]            source_keys this godchild can see in the rosary
                                    set manually in admin, no defaults
push_subscription jsonb (optional)  Web Push subscription object, written client-side on opt-in
```

### Saints
```
name        text
slug        text
feast_day   text (MM-DD)
description rich text
image       upload (Blob)
prayers     relation[] → Prayers
```

### Prayers
```
title     text
content   rich text
category  select: base | chapelet | angelus | intercession | litanie
tags      text[]
audio     upload (Blob, optional)
```

### Mysteries
```
name           text
mystery_type   select: joyeux | douloureux | glorieux | lumineux
order          number (1–5)
fruit          text
introduction   rich text    (shown before the 5 accordions — e.g. the JP2 quote for Douloureux)
days           text[]       e.g. ["mardi", "vendredi"] — for mystery-of-the-day highlight
readings       component[]:
  source_key   text         e.g. "st-luc", "st-marc", "sainte-rita"
  source_label text         display name
  content      rich text
audio_meditation  upload (Blob, optional)
```

### Briques
```
title          text
content        rich text
type           select: text | audio
audio_file     upload (Blob, optional)
target         relation → Godchildren | null (null = all)
scheduled_date date (optional)
published      boolean
```

### Feedback
```
brique      relation → Briques
godchild    relation → Godchildren
reaction    select: 🙏 | ❤️ | ✝️
message     text (optional)
read_at     timestamp — written via POST /api/feedback/read when brique page mounts (client-side, fire-and-forget)
```

---

## Page Designs

### Dashboard (`/[slug]/[token]`)

Brique-first layout:

1. **Latest published brique** — full-width card, large readable text. If type=audio: inline audio player.
2. **Reaction strip** — three emoji buttons (🙏 ❤️ ✝️). Tap writes to Feedback collection. One reaction per brique.
3. **Navigation grid** — 3 icon cards: Chapelet · Prières · Saint [Patron Name]
4. **Briques archive link** — small, below the grid

If no brique is published yet: show a welcome message with the patron saint's name.

### Chapelet (`/[slug]/[token]/chapelet`)

1. **Mystery picker** — list of 4 mystery types with icon + days. Today's mystery highlighted in accent color (computed from `days` field vs current day of week). User can pick any.
2. **Mystery type page**:
   - Introduction text (rich text, from `introduction` field)
   - 5 accordions, one per mystery
   - Each accordion header: mystery name + fruit
   - Expanded: reading picker — only shows readings where `source_key ∈ godchild.allowed_sources`
   - Selected reading: expands inline below the picker
   - Optional: audio meditation player if `audio_meditation` is set
3. **Progress**: stored in `localStorage` keyed by `[slug]-[mystery_type]-[date]`. No DB writes for reading state.

### Prières (`/[slug]/[token]/prieres`)

Grouped by category (base, chapelet, angelus, intercession, litanie). Each prayer title is tappable → expands inline. Audio player shown if prayer has an audio file.

### Saint Patron (`/[slug]/[token]/saint`)

Saint image, name, feast day, description, list of linked prayers. If today is the feast day: banner highlight.

### Briques archive (`/[slug]/[token]/briques`)

Reverse-chronological list of all published briques targeted at this godchild (or "all"). Unread shown with a dot indicator. Read state tracked via Feedback `read_at`.

---

## PWA Setup

- `manifest.json`: name, icons (cross or saint icon), `display: standalone`, `theme_color` per godchild (via dynamic manifest route)
- Service worker: offline cache for prayers and last-viewed brique
- Web Push: notify on new published brique targeted at the godchild
  - iOS 16.4+ required for push on Safari
  - Permission prompt shown after first visit to dashboard
  - Push subscription stored in Godchildren collection (`push_subscription` JSON field)

---

## Content Migration from recueil.md

All content in `recueil.md` maps to Payload collections:

| recueil.md section | Collection |
|---|---|
| Prières du Chrétien (Actes, Angelus…) | Prayers (category: base) |
| Le Chapelet — 4 mystery types + 20 mysteries | Mysteries |
| La Prière de Jésus | Prayers (category: base) |
| Per-mystery intro texts | Mysteries.introduction |

Seeded manually via Payload admin. No automated import script needed for MVP (content is finite and structured).

---

## Design System

- **Dark mode by default** — essential for evening/morning prayer
- **Liturgical accent colors** per godchild (set via `theme_color`):
  - Violet — Avent/Carême
  - Blanc — fêtes, Pâques
  - Vert — temps ordinaire
  - Rouge — martyrs, Pentecôte
  - Or — solennités
- **Typography**: serif for prayer content (Georgia or similar), sans-serif for UI chrome
- **No distractions**: no infinite scroll, no push for engagement, no ads. Single-purpose screens.

---

## Future (1-year horizon)

When opening to anyone:
- Add email/magic-link auth (Payload has built-in auth)
- Replace hardcoded godchild profiles with self-serve registration
- Add godfather → godchild pairing flow
- `allowed_sources` becomes user-configurable preference
- The private URL token model can coexist with auth (token becomes optional for registered users)

No architectural changes needed — Payload and Next.js scale to this naturally.

---

## Out of Scope (MVP)

- Automated liturgical calendar sync
- In-app messaging / chat
- Social features between godchildren
- iOS native app
- Localization (French only)
