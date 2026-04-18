# Sainteté — Redesign Spec
**Date:** 2026-04-19  
**Scope:** Aesthetics, prayer page restructure, brique detail, liturgical colors, pinned prayers

---

## 1. Aesthetic — Ivory + Crimson theme

Replace the current dark theme (`bg-zinc-950 / bg-gray-950`) with a light, prayer-book palette.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#F5F0E5` | Page background |
| `--bg-card` | `#FFFFFF` | Cards, prayer items |
| `--bg-subtle` | `#FAF7F2` | Expanded content bg |
| `--bg-muted` | `#EDE8DC` | Catéchèse block bg |
| `--border` | `#DDD4BE` | All borders |
| `--text` | `#1a1209` | Body text |
| `--text-muted` | `#6b5a3a` | Secondary text, labels |
| `--accent` | `#8B1A1A` | Crimson — labels, arrows, CTAs |
| `--liturgy` | (from godchild) | Left-border accent — liturgical season |

**Font:** Replace Geist with **Cormorant Garamond** (Google Fonts) — serif for all text. The existing `font-serif` utility already used in prayer/brique content will now actually match the loaded font.

**Liturgical colors** (`--liturgy` CSS custom property):

| `theme_color` value | Color |
|---|---|
| `violet` | `#6B3FA0` |
| `vert` | `#2E7D32` |
| `rouge` | `#B71C1C` |
| `or` | `#F9A825` |
| `blanc` | `#AAAAAA` |

Applied as `style={{ '--liturgy': color } as CSSProperties}` on the root wrapper in `app/(app)/[slug]/[token]/layout.tsx`. All cards use `border-left: 3px solid var(--liturgy)` with `border-radius: 0 10px 10px 0`.

**Implementation scope:** `app/globals.css`, `app/(app)/layout.tsx`, `app/(app)/[slug]/[token]/layout.tsx`, and all components.

---

## 2. Dashboard changes

**File:** `app/(app)/[slug]/[token]/page.tsx`

### 2a. Brique du jour — clickable
The brique card becomes a `<Link href={`/${slug}/${token}/briques/${brique.id}`}>`. Add a subtle tap hint ("Lire et réagir →") below the excerpt. Show only a short excerpt (first paragraph) on the dashboard, not full text.

Remove the existing `<ReactionStrip>` from the dashboard — reactions now live on the brique detail page.

### 2b. Pinned prayers
Below the brique card, show up to 2 pinned prayers. These are stored in `localStorage` under key `saintete-pinned-${slug}` as a JSON array of prayer IDs (max 2 items).

The dashboard is a Server Component, so pinned prayers are rendered client-side only. Extract a `<PinnedPrayers slug token />` Client Component that reads localStorage on mount, fetches prayers via a new **unauthenticated** route handler `GET /api/prayers/[id]` (prayers are shared content, no godchild-specific data), and renders them using the existing `<PrayerItem>` component (inline expand, same behaviour as on the category page).

If localStorage is empty or no prayers are pinned, render nothing (no empty state — keep the dashboard clean).

---

## 3. Brique detail page

**New file:** `app/(app)/[slug]/[token]/briques/[id]/page.tsx`

Shows the full brique text (all richText nodes), then a feedback section:

- **Emoji picker**: 3 buttons (🙏 ❤️ ✝️), single-select, toggles visual state
- **Comment field**: `<textarea>` — optional free text
- **Send button**: POST to existing `/api/feedback/read`, extended to also accept an optional `comment` string field. Creates or updates a `Feedback` record.

**Feedback collection change:** Add a `comment` field (textarea, optional) to the existing `Feedback` collection. The existing `reaction` field stays (🙏❤️✝️ select). The `/api/feedback/read` route handler accepts and persists `comment` alongside `reaction`.

**Back navigation:** `← Retour` link back to `/${slug}/${token}`.

---

## 4. Prayer page restructure

### 4a. New Payload entities

**Global: `PrayerPageConfig`**
```
intro_text       richText   — The Mère Teresa quote + intro paragraph (pre-seeded)
catechese_title  text       — "Qu'est-ce que la prière ?" (default)
catechese_content richText  — Lines 11–80 of prières.md (pre-seeded)
```

**Collection: `PrayerCategories`**
```
name    text     required — "Prières du chrétien"
slug    text     required — "base" (unique, URL-safe)
order   number   required — display order
```
Pre-seed: base, chapelet, angelus, intercession, litanie (matching existing prayer category values).

**Prayer collection change:** `category` field changes from `select` to `relationship` → `PrayerCategories` collection (single relation, required). Existing prayer documents must be migrated (slug values match, so a migration script maps old select value → new relation ID).

### 4b. Prayer index page

**File:** `app/(app)/[slug]/[token]/prieres/page.tsx`

Layout:
1. Intro text (richText from `PrayerPageConfig.intro_text`) — italic, left-bordered muted style
2. Catéchèse block — styled differently from prayer categories (muted background `#EDE8DC`, left crimson border). Tapping → navigates to `/prieres/catechese`.
3. "Rubriques" label (uppercase small caps)
4. List of `PrayerCategories` ordered by `order` field — each a big tappable block (white card, left liturgy-color border) showing name + prayer count. Tapping → `/prieres/[slug]`.

### 4c. Catéchèse page

**New file:** `app/(app)/[slug]/[token]/prieres/catechese/page.tsx`

Renders `PrayerPageConfig.catechese_title` as page title and `catechese_content` as richText body. Full sermon-style layout: generous line-height, serif, inline quotes styled with left-border.

### 4d. Category detail page

**New file:** `app/(app)/[slug]/[token]/prieres/[categorySlug]/page.tsx`

- Fetches the `PrayerCategory` by slug, 404 if not found
- Fetches all prayers where `category.slug == categorySlug`
- Renders each as a `<PrayerItem>` (existing component — inline expand, audio player if present)
- Page title = category name, back link → `/prieres`

### 4e. Pin icon on PrayerItem

Add a 📌 pin icon (right side, next to the expand arrow) to `PrayerItem`. Clicking it toggles the prayer in localStorage (`saintete-pinned-${slug}`). Max 2 pinned — if already 2, replace the oldest. Visual: filled pin = pinned, outline/faded = not pinned. This is client-side only.

---

## 5. Liturgical colors — fix

**Current bug:** `THEME_COLORS` in `layout.tsx` defines Tailwind class strings but the `data-theme` attribute is never read by any CSS rule. Child components hardcode `text-white/40`, `border-white/10`, etc. — the theme color is effectively unused.

**Fix:** 
1. Remove the `THEME_COLORS` Record.
2. In `app/(app)/[slug]/[token]/layout.tsx`, resolve the godchild's `theme_color` to a hex value and inject it as a CSS custom property via `style` prop on the root div:
   ```tsx
   const LITURGY_COLORS = { violet: '#6B3FA0', vert: '#2E7D32', rouge: '#B71C1C', or: '#F9A825', blanc: '#AAAAAA' }
   const liturgyColor = LITURGY_COLORS[godchild.theme_color ?? 'violet'] ?? '#6B3FA0'
   // <div style={{ '--liturgy': liturgyColor } as CSSProperties}>
   ```
3. All card components use `style={{ borderLeftColor: 'var(--liturgy)' }}` or a shared `card` CSS class that reads `var(--liturgy)`.

---

## 6. Out of scope (this iteration)

- Magic-link auth
- Liturgical calendar API (theme_color stays manual in Payload admin)
- Pinned prayers synced to DB (v2)
- Category-level audio/intro text
