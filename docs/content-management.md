# Content management

Everything is managed via the Payload admin panel at `/admin` (production: your Vercel URL + `/admin`).

---

## Adding a godchild

1. Go to **Godchildren → Create**
2. Fill in `name`, `slug` (lowercase, no spaces), `theme_color`
3. Leave `token` blank — it is auto-generated on save
4. Set `active: true`
5. Assign a patron saint if one exists
6. Add `allowed_sources` — these control which gospel readings appear in the chapelet detail (e.g. `st-luc`, `st-matthieu`)
7. Save → copy the URL: `https://your-domain/[slug]/[token]`

Share the URL with the godchild. That URL never changes unless you regenerate the token.

!!! warning "Deactivating a godchild"
    Setting `active: false` immediately makes all their URLs return 404. Useful if a phone is lost.

---

## Adding prayers

Source of truth: `recueil.md` at repo root. Copy content from there.

1. Go to **Prayers → Create**
2. Set `category`:
   - `base` — standard prayers (Notre Père, Je vous salue Marie, etc.)
   - `chapelet` — rosary-specific
   - `angelus`, `intercession`, `litanie` — as labelled in the recueil
3. Paste `content` using the rich text editor
4. Upload `audio` if you have a recording

---

## Adding mysteries

There are 20 mysteries (5 per type × 4 types). Add them once.

1. Go to **Mysteries → Create**
2. Set `mystery_type` (joyeux / lumineux / douloureux / glorieux) and `order` (1–5)
3. Fill `name`, `fruit`, `introduction`
4. Set `days` — the weekdays this mystery type is traditionally prayed:
   - Joyeux → lundi, samedi
   - Lumineux → jeudi
   - Douloureux → mardi, vendredi
   - Glorieux → mercredi, dimanche
5. Add `readings` — each reading needs a `source_key` (e.g. `st-luc`) and `source_label` plus the text
6. The `source_key` must match what's listed in each godchild's `allowed_sources`

---

## Adding a brique

A *brique* is a short note or audio message pushed to one or all godchildren.

1. Go to **Briques → Create**
2. Write `title` and `content`
3. Set `type`: `text` or `audio` (upload file if audio)
4. Set `target`: leave blank for all godchildren, or pick one
5. Set `scheduled_date` if you want it to appear on a specific day
6. Toggle `published: true` when ready

---

## Adding a saint

1. Go to **Saints → Create**
2. Fill `name`, `slug`, `feast_day` (format: `MM-DD`, e.g. `01-28`)
3. Add `description` and upload an `image`
4. Add embedded `prayers` specific to that saint

---

## Sending a push notification

Push is triggered manually from code (no admin UI yet). The godchild must have:
- Installed the app via "Add to Home Screen" (iOS 16.4+ required)
- Accepted the push permission prompt shown on the dashboard

The push subscription is stored automatically in their `Godchildren` record after they accept.
