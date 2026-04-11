# Sainteté PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PWA for spiritual accompaniment — private URLs per godchild, Payload CMS admin, interactive rosary with per-godchild reading visibility, brique-first dashboard, Web Push.

**Architecture:** Next.js 15 App Router + Payload CMS v3 in a single Vercel deployment. Neon Postgres via Vercel integration. Token-in-URL auth validated in Next.js middleware. No login system.

**Tech Stack:** Next.js 15, Payload CMS v3, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, Neon Postgres, Vercel Blob, `@ducanh2912/next-pwa`, Tailwind CSS, TypeScript, Jest + Testing Library.

**Design spec:** `docs/superpowers/specs/2026-04-11-saintete-design.md`

---

## File Map

```
app_saintete/
├── payload.config.ts                         # Payload root config
├── next.config.ts                            # Next.js config with Payload + PWA
├── middleware.ts                             # Token validation for all /[slug]/[token]/* routes
├── collections/
│   ├── Godchildren.ts                        # Payload collection: Godchildren
│   ├── Saints.ts                             # Payload collection: Saints
│   ├── Prayers.ts                            # Payload collection: Prayers
│   ├── Mysteries.ts                          # Payload collection: Mysteries (with readings component)
│   ├── Briques.ts                            # Payload collection: Briques
│   └── Feedback.ts                           # Payload collection: Feedback
├── lib/
│   ├── payload.ts                            # Payload local API singleton
│   ├── auth.ts                               # resolveGodchild(slug, token) — throws 404 if invalid
│   └── mystery-of-day.ts                     # getMysteryOfDay() → mystery_type string
├── app/
│   ├── layout.tsx                            # Root layout (font, PWA meta)
│   ├── (payload)/
│   │   ├── admin/[[...segments]]/page.tsx    # Payload admin UI
│   │   ├── admin/[[...segments]]/not-found.tsx
│   │   └── api/[...slug]/route.ts            # Payload REST + GraphQL
│   ├── api/
│   │   ├── feedback/read/route.ts            # POST: mark brique as read, store reaction
│   │   └── push/subscribe/route.ts           # POST: store Web Push subscription
│   └── [slug]/[token]/
│       ├── layout.tsx                        # Shared godchild layout (resolves + passes godchild)
│       ├── page.tsx                          # Dashboard (brique-first)
│       ├── chapelet/page.tsx                 # Mystery picker
│       ├── chapelet/[type]/page.tsx          # Mystery list + accordions
│       ├── prieres/page.tsx                  # Prayer library
│       ├── saint/page.tsx                    # Patron saint page
│       └── briques/page.tsx                  # Briques archive
├── components/
│   ├── BriqueCard.tsx                        # Displays one brique (text or audio)
│   ├── ReactionStrip.tsx                     # 🙏 ❤️ ✝️ reaction buttons
│   ├── NavGrid.tsx                           # Icon grid: Chapelet / Prières / Saint
│   ├── MysteryPicker.tsx                     # 4 mystery types list with today highlight
│   ├── MysteryAccordion.tsx                  # Single mystery accordion + reading picker
│   ├── ReadingPicker.tsx                     # Filtered reading tabs inside accordion
│   └── PrayerItem.tsx                        # Expandable prayer row
├── __tests__/
│   ├── lib/auth.test.ts
│   ├── lib/mystery-of-day.test.ts
│   └── components/MysteryAccordion.test.tsx
└── public/
    └── icons/                                # PWA icons (192, 512)
```

---

## Phase 1 — Project Scaffold

### Task 1: Initialize Next.js + Payload + Dependencies

**Files:**
- Create: `next.config.ts`
- Create: `payload.config.ts`
- Create: `app/layout.tsx`
- Create: `app/(payload)/api/[...slug]/route.ts`
- Create: `app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `app/(payload)/admin/[[...segments]]/not-found.tsx`

- [ ] **Step 1: Back up and clear existing package.json**

```bash
cd /path/to/app_saintete
mv package.json package.json.bak
mv package-lock.json package-lock.json.bak
```

- [ ] **Step 2: Scaffold Next.js 15**

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

When prompted: accept all defaults. This creates `app/`, `public/`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`.

- [ ] **Step 3: Install Payload and database adapter**

```bash
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical sharp
npm install @vercel/blob
npm install web-push
npm install --save-dev @types/web-push
```

- [ ] **Step 4: Install PWA plugin**

```bash
npm install @ducanh2912/next-pwa
```

- [ ] **Step 5: Set up environment variables**

Create `.env.local`:
```bash
DATABASE_URI=postgresql://user:pass@host/db?sslmode=require
PAYLOAD_SECRET=change-me-32-chars-minimum
BLOB_READ_WRITE_TOKEN=vercel_blob_...
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@example.com
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```
Copy the output into `.env.local`.

- [ ] **Step 6: Create `payload.config.ts`**

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [], // filled in Task 2
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
})
```

- [ ] **Step 7: Create Payload route handlers**

`app/(payload)/api/[...slug]/route.ts`:
```typescript
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import config from '@payload-config'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
```

`app/(payload)/admin/[[...segments]]/page.tsx`:
```typescript
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'

export const generateMetadata = ({ params }: any) =>
  generatePageMetadata({ config, params })

const Page = ({ params }: any) => RootPage({ config, params })
export default Page
```

`app/(payload)/admin/[[...segments]]/not-found.tsx`:
```typescript
import { NotFoundPage } from '@payloadcms/next/views'
import config from '@payload-config'
const NotFound = ({ params }: any) => NotFoundPage({ config, params })
export default NotFound
```

- [ ] **Step 8: Update `next.config.ts`**

```typescript
import { withPayload } from '@payloadcms/next'
import withPWA from '@ducanh2912/next-pwa'

const withPWAConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withPayload(withPWAConfig(nextConfig))
```

- [ ] **Step 9: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sainteté',
  description: 'Compagnon de prière',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${geist.className} bg-gray-950 text-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 10: Add PWA manifest and icons**

Create `public/manifest.json`:
```json
{
  "name": "Sainteté",
  "short_name": "Sainteté",
  "description": "Compagnon de prière",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#030712",
  "theme_color": "#7c3aed",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add placeholder icons (cross symbol on dark background) at `public/icons/icon-192.png` and `public/icons/icon-512.png`. Use any 192×192 and 512×512 PNG for now; replace with final art later.

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts on `localhost:3000`, no TypeScript errors. Visit `localhost:3000/admin` — should show Payload admin login.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 + Payload CMS v3"
```

---

### Task 2: Payload Collections

**Files:**
- Create: `collections/Godchildren.ts`
- Create: `collections/Saints.ts`
- Create: `collections/Prayers.ts`
- Create: `collections/Mysteries.ts`
- Create: `collections/Briques.ts`
- Create: `collections/Feedback.ts`
- Modify: `payload.config.ts`

- [ ] **Step 1: Create `collections/Godchildren.ts`**

```typescript
import type { CollectionConfig } from 'payload'
import crypto from 'crypto'

export const Godchildren: CollectionConfig = {
  slug: 'godchildren',
  admin: { useAsTitle: 'name' },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.token) {
          data.token = crypto.randomBytes(12).toString('hex')
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true,
      admin: { description: 'URL-safe, lowercase, no spaces. e.g. martin' } },
    { name: 'token', type: 'text', required: false,
      admin: { readOnly: true, description: 'Auto-generated. Change to revoke access.' } },
    { name: 'patron_saint', type: 'relationship', relationTo: 'saints' },
    {
      name: 'theme_color',
      type: 'select',
      defaultValue: 'violet',
      options: [
        { label: 'Violet (Avent/Carême)', value: 'violet' },
        { label: 'Blanc (Fêtes)', value: 'blanc' },
        { label: 'Vert (Temps ordinaire)', value: 'vert' },
        { label: 'Rouge (Martyrs)', value: 'rouge' },
        { label: 'Or (Solennités)', value: 'or' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    {
      name: 'allowed_sources',
      type: 'array',
      admin: { description: 'Reading source keys this godchild can see in the rosary. e.g. st-luc, st-marc, sainte-rita' },
      fields: [
        { name: 'source_key', type: 'text', required: true },
      ],
    },
    {
      name: 'push_subscription',
      type: 'json',
      admin: { readOnly: true, description: 'Web Push subscription. Written client-side on opt-in.' },
    },
  ],
}
```

- [ ] **Step 2: Create `collections/Saints.ts`**

```typescript
import type { CollectionConfig } from 'payload'

export const Saints: CollectionConfig = {
  slug: 'saints',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'feast_day', type: 'text',
      admin: { description: 'Format MM-DD, e.g. 09-29 for Saint Michel' } },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'prayers', type: 'relationship', relationTo: 'prayers', hasMany: true },
  ],
}
```

- [ ] **Step 3: Create `collections/Prayers.ts`**

```typescript
import type { CollectionConfig } from 'payload'

export const Prayers: CollectionConfig = {
  slug: 'prayers',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Base (Actes, Credo…)', value: 'base' },
        { label: 'Chapelet', value: 'chapelet' },
        { label: 'Angélus', value: 'angelus' },
        { label: 'Intercession', value: 'intercession' },
        { label: 'Litanie', value: 'litanie' },
      ],
    },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'audio', type: 'upload', relationTo: 'media' },
  ],
}
```

- [ ] **Step 4: Create `collections/Mysteries.ts`**

```typescript
import type { CollectionConfig } from 'payload'

export const Mysteries: CollectionConfig = {
  slug: 'mysteries',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'mystery_type',
      type: 'select',
      required: true,
      options: [
        { label: 'Joyeux', value: 'joyeux' },
        { label: 'Douloureux', value: 'douloureux' },
        { label: 'Glorieux', value: 'glorieux' },
        { label: 'Lumineux', value: 'lumineux' },
      ],
    },
    { name: 'order', type: 'number', required: true,
      admin: { description: '1 to 5' } },
    { name: 'fruit', type: 'text', required: true },
    { name: 'introduction', type: 'richText',
      admin: { description: 'Shown before the 5 mysteries for this type. JP2 quote, theological intro, etc.' } },
    {
      name: 'days',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Lundi', value: 'lundi' },
        { label: 'Mardi', value: 'mardi' },
        { label: 'Mercredi', value: 'mercredi' },
        { label: 'Jeudi', value: 'jeudi' },
        { label: 'Vendredi', value: 'vendredi' },
        { label: 'Samedi', value: 'samedi' },
        { label: 'Dimanche', value: 'dimanche' },
      ],
    },
    {
      name: 'readings',
      type: 'array',
      fields: [
        { name: 'source_key', type: 'text', required: true,
          admin: { description: 'Lowercase kebab-case key. e.g. st-luc, st-marc, sainte-rita' } },
        { name: 'source_label', type: 'text', required: true,
          admin: { description: 'Display name. e.g. Évangile selon Saint Luc' } },
        { name: 'content', type: 'richText', required: true },
      ],
    },
    { name: 'audio_meditation', type: 'upload', relationTo: 'media' },
  ],
}
```

- [ ] **Step 5: Create `collections/Briques.ts`**

```typescript
import type { CollectionConfig } from 'payload'

export const Briques: CollectionConfig = {
  slug: 'briques',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'text',
      options: [
        { label: 'Texte', value: 'text' },
        { label: 'Audio', value: 'audio' },
      ],
    },
    { name: 'audio_file', type: 'upload', relationTo: 'media' },
    { name: 'target', type: 'relationship', relationTo: 'godchildren',
      admin: { description: 'Leave empty to send to all godchildren.' } },
    { name: 'scheduled_date', type: 'date' },
    { name: 'published', type: 'checkbox', defaultValue: false },
  ],
}
```

- [ ] **Step 6: Create `collections/Feedback.ts`**

```typescript
import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'brique', type: 'relationship', relationTo: 'briques', required: true },
    { name: 'godchild', type: 'relationship', relationTo: 'godchildren', required: true },
    {
      name: 'reaction',
      type: 'select',
      options: [
        { label: '🙏', value: 'pray' },
        { label: '❤️', value: 'love' },
        { label: '✝️', value: 'cross' },
      ],
    },
    { name: 'message', type: 'text' },
    { name: 'read_at', type: 'date' },
  ],
}
```

- [ ] **Step 7: Add Media collection and register all collections in `payload.config.ts`**

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Godchildren } from './collections/Godchildren'
import { Saints } from './collections/Saints'
import { Prayers } from './collections/Prayers'
import { Mysteries } from './collections/Mysteries'
import { Briques } from './collections/Briques'
import { Feedback } from './collections/Feedback'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: { user: 'users' },
  collections: [
    Godchildren,
    Saints,
    Prayers,
    Mysteries,
    Briques,
    Feedback,
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
      fields: [{ name: 'alt', type: 'text' }],
    },
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),
  sharp,
})
```

- [ ] **Step 8: Generate types and run migration**

```bash
npm run dev  # starts server, Payload auto-generates payload-types.ts
# In a second terminal:
npx payload migrate:create --name initial_schema
npx payload migrate
```

Expected: migration runs, all 7 tables created in Neon Postgres.

- [ ] **Step 9: Create admin user via CLI**

```bash
npx payload create-first-user
```

Follow the prompts. This is your admin login for `/admin`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: define all Payload collections and run initial migration"
```

---

## Phase 2 — Auth & Routing Infrastructure

### Task 3: Token Validation — lib/auth.ts + middleware

**Files:**
- Create: `lib/payload.ts`
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Create: `__tests__/lib/auth.test.ts`

- [ ] **Step 1: Create `lib/payload.ts` — singleton Payload local API**

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

let cached: ReturnType<typeof getPayload> | null = null

export async function getPayloadClient() {
  if (!cached) {
    cached = getPayload({ config })
  }
  return cached
}
```

- [ ] **Step 2: Write the failing tests for `lib/auth.ts`**

Create `__tests__/lib/auth.test.ts`:

```typescript
import { resolveGodchild } from '@/lib/auth'

// Mock Payload client
jest.mock('@/lib/payload', () => ({
  getPayloadClient: jest.fn(),
}))

import { getPayloadClient } from '@/lib/payload'

const mockPayload = {
  find: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(getPayloadClient as jest.Mock).mockResolvedValue(mockPayload)
})

describe('resolveGodchild', () => {
  it('returns godchild when slug and token match', async () => {
    const godchild = { id: 1, name: 'Martin', slug: 'martin', token: 'abc123', active: true }
    mockPayload.find.mockResolvedValue({ docs: [godchild] })

    const result = await resolveGodchild('martin', 'abc123')
    expect(result).toEqual(godchild)
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'godchildren',
      where: { and: [{ slug: { equals: 'martin' } }, { token: { equals: 'abc123' } }, { active: { equals: true } }] },
      limit: 1,
    })
  })

  it('returns null when no match found', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })
    const result = await resolveGodchild('martin', 'wrongtoken')
    expect(result).toBeNull()
  })

  it('returns null when godchild is inactive', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] }) // active: false filtered by query
    const result = await resolveGodchild('martin', 'abc123')
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- __tests__/lib/auth.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/auth'`

- [ ] **Step 4: Create `lib/auth.ts`**

```typescript
import { getPayloadClient } from './payload'
import type { Godchild } from '@/payload-types'

export async function resolveGodchild(
  slug: string,
  token: string,
): Promise<Godchild | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'godchildren',
    where: {
      and: [
        { slug: { equals: slug } },
        { token: { equals: token } },
        { active: { equals: true } },
      ],
    },
    limit: 1,
  })
  return (result.docs[0] as Godchild) ?? null
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/auth.test.ts
```

Expected: PASS — 3 tests passing

- [ ] **Step 6: Create `middleware.ts`**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect godchild routes, not admin or API
  const { pathname } = request.nextUrl
  const match = pathname.match(/^\/([^/]+)\/([^/]+)/)
  if (!match) return NextResponse.next()

  // Token existence check only — full DB validation happens in layout.tsx
  // (middleware runs on edge, Payload local API needs Node runtime)
  const [, slug, token] = match
  if (!slug || !token || token.length < 16) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!admin|api|_next|icons|manifest.json).*)'],
}
```

> Note: Full DB token validation runs in `app/[slug]/[token]/layout.tsx` (Node runtime). Middleware does a fast format check only to fail obviously bad URLs early.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: auth lib and middleware for token URL validation"
```

---

### Task 4: lib/mystery-of-day.ts

**Files:**
- Create: `lib/mystery-of-day.ts`
- Create: `__tests__/lib/mystery-of-day.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/mystery-of-day.test.ts`:

```typescript
import { getMysteryTypeForDay } from '@/lib/mystery-of-day'

describe('getMysteryTypeForDay', () => {
  // Traditional rosary day assignments:
  // Joyeux: lundi, samedi
  // Douloureux: mardi, vendredi
  // Glorieux: mercredi, dimanche
  // Lumineux: jeudi

  it('returns joyeux for Monday (day 1)', () => {
    expect(getMysteryTypeForDay(1)).toBe('joyeux')
  })

  it('returns douloureux for Tuesday (day 2)', () => {
    expect(getMysteryTypeForDay(2)).toBe('douloureux')
  })

  it('returns glorieux for Wednesday (day 3)', () => {
    expect(getMysteryTypeForDay(3)).toBe('glorieux')
  })

  it('returns lumineux for Thursday (day 4)', () => {
    expect(getMysteryTypeForDay(4)).toBe('lumineux')
  })

  it('returns douloureux for Friday (day 5)', () => {
    expect(getMysteryTypeForDay(5)).toBe('douloureux')
  })

  it('returns joyeux for Saturday (day 6)', () => {
    expect(getMysteryTypeForDay(6)).toBe('joyeux')
  })

  it('returns glorieux for Sunday (day 0)', () => {
    expect(getMysteryTypeForDay(0)).toBe('glorieux')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/lib/mystery-of-day.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/mystery-of-day'`

- [ ] **Step 3: Create `lib/mystery-of-day.ts`**

```typescript
// Day of week: 0 = Sunday, 1 = Monday, …, 6 = Saturday
// Rosary tradition:
const DAY_MAP: Record<number, string> = {
  0: 'glorieux',  // Sunday
  1: 'joyeux',    // Monday
  2: 'douloureux',// Tuesday
  3: 'glorieux',  // Wednesday
  4: 'lumineux',  // Thursday
  5: 'douloureux',// Friday
  6: 'joyeux',    // Saturday
}

export function getMysteryTypeForDay(dayOfWeek: number): string {
  return DAY_MAP[dayOfWeek] ?? 'joyeux'
}

export function getTodaysMysteryType(): string {
  return getMysteryTypeForDay(new Date().getDay())
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/mystery-of-day.test.ts
```

Expected: PASS — 7 tests passing

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: mystery-of-day utility with tests"
```

---

## Phase 3 — Godchild Layout + Dashboard

### Task 5: Shared Godchild Layout

**Files:**
- Create: `app/[slug]/[token]/layout.tsx`

- [ ] **Step 1: Create the shared godchild layout**

This layout runs on every godchild page. It validates the token via DB and passes the resolved godchild to child pages.

```typescript
import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import type { Godchild } from '@/payload-types'

// Color map for Tailwind accent classes
export const THEME_COLORS: Record<string, { accent: string; border: string; bg: string }> = {
  violet: { accent: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-950/30' },
  blanc:  { accent: 'text-white',      border: 'border-white/40',   bg: 'bg-white/10' },
  vert:   { accent: 'text-green-400',  border: 'border-green-500',  bg: 'bg-green-950/30' },
  rouge:  { accent: 'text-red-400',    border: 'border-red-500',    bg: 'bg-red-950/30' },
  or:     { accent: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-950/30' },
}

export default async function GodchildLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string; token: string }
}) {
  const godchild = await resolveGodchild(params.slug, params.token)
  if (!godchild) notFound()

  return (
    <div data-theme={godchild.theme_color ?? 'violet'}>
      {children}
    </div>
  )
}
```

> Note: `resolveGodchild` result must be passed to child pages. Since React Server Components can't pass props across layouts, child pages each call `resolveGodchild` themselves (it's cached by Next.js request deduplication within a single request).

- [ ] **Step 2: Commit**

```bash
git add app/[slug]/[token]/layout.tsx
git commit -m "feat: godchild layout with DB token validation"
```

---

### Task 6: Dashboard Page

**Files:**
- Create: `components/BriqueCard.tsx`
- Create: `components/ReactionStrip.tsx`
- Create: `components/NavGrid.tsx`
- Create: `app/[slug]/[token]/page.tsx`
- Create: `app/api/feedback/read/route.ts`

- [ ] **Step 1: Create `components/BriqueCard.tsx`**

```typescript
import type { Brique } from '@/payload-types'

export function BriqueCard({ brique }: { brique: Brique }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-1 text-xs uppercase tracking-widest text-white/40">
        ✦ Brique du jour
      </div>
      <h2 className="mb-4 text-xl font-serif font-semibold">{brique.title}</h2>
      {brique.type === 'audio' && brique.audio_file ? (
        <audio
          controls
          src={typeof brique.audio_file === 'object' ? brique.audio_file.url ?? '' : ''}
          className="w-full"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none font-serif">
          {/* Rich text rendering: use @payloadcms/richtext-lexical/react */}
          <RichText content={brique.content} />
        </div>
      )}
    </div>
  )
}

// Minimal RichText renderer — replace with @payloadcms/richtext-lexical/react if available
function RichText({ content }: { content: any }) {
  if (!content?.root?.children) return null
  return (
    <div>
      {content.root.children.map((node: any, i: number) => {
        if (node.type === 'paragraph') {
          return <p key={i}>{node.children?.map((c: any) => c.text).join('')}</p>
        }
        return null
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/ReactionStrip.tsx`**

```typescript
'use client'
import { useState } from 'react'

const REACTIONS = [
  { key: 'pray', emoji: '🙏' },
  { key: 'love', emoji: '❤️' },
  { key: 'cross', emoji: '✝️' },
]

export function ReactionStrip({
  briqueId,
  godchildId,
}: {
  briqueId: string | number
  godchildId: string | number
}) {
  const [selected, setSelected] = useState<string | null>(null)

  async function handleReaction(key: string) {
    if (selected) return // one reaction per brique
    setSelected(key)
    await fetch('/api/feedback/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briqueId, godchildId, reaction: key }),
    })
  }

  return (
    <div className="flex gap-4 justify-center mt-4">
      {REACTIONS.map(({ key, emoji }) => (
        <button
          key={key}
          onClick={() => handleReaction(key)}
          disabled={!!selected}
          className={`text-3xl transition-transform hover:scale-125 disabled:opacity-40 ${
            selected === key ? 'scale-125' : ''
          }`}
          aria-label={key}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/NavGrid.tsx`**

```typescript
import Link from 'next/link'

export function NavGrid({
  slug,
  token,
  patronSaintName,
}: {
  slug: string
  token: string
  patronSaintName?: string
}) {
  const base = `/${slug}/${token}`
  const items = [
    { href: `${base}/chapelet`, icon: '📿', label: 'Chapelet' },
    { href: `${base}/prieres`, icon: '🙏', label: 'Prières' },
    { href: `${base}/saint`, icon: '✝️', label: patronSaintName ?? 'Saint Patron' },
  ]
  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      {items.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-xs text-white/70">{label}</span>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/api/feedback/read/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const { briqueId, godchildId, reaction } = await req.json()
  if (!briqueId || !godchildId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  // Check if feedback already exists
  const existing = await payload.find({
    collection: 'feedback',
    where: {
      and: [
        { brique: { equals: briqueId } },
        { godchild: { equals: godchildId } },
      ],
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    // Update reaction if not already set
    const doc = existing.docs[0]
    if (!doc.reaction && reaction) {
      await payload.update({
        collection: 'feedback',
        id: doc.id,
        data: { reaction },
      })
    }
    return NextResponse.json({ ok: true })
  }

  await payload.create({
    collection: 'feedback',
    data: {
      brique: briqueId,
      godchild: godchildId,
      reaction: reaction ?? null,
      read_at: new Date().toISOString(),
    },
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Create `app/[slug]/[token]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { BriqueCard } from '@/components/BriqueCard'
import { ReactionStrip } from '@/components/ReactionStrip'
import { NavGrid } from '@/components/NavGrid'
import type { Brique, Godchild } from '@/payload-types'

export default async function DashboardPage({
  params,
}: {
  params: { slug: string; token: string }
}) {
  const godchild = await resolveGodchild(params.slug, params.token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

  // Latest published brique for this godchild (targeted or for all)
  const briquesResult = await payload.find({
    collection: 'briques',
    where: {
      and: [
        { published: { equals: true } },
        {
          or: [
            { target: { equals: godchild.id } },
            { target: { exists: false } },
          ],
        },
      ],
    },
    sort: '-createdAt',
    limit: 1,
    depth: 1,
  })

  const latestBrique = briquesResult.docs[0] as Brique | undefined

  const patronSaint = typeof godchild.patron_saint === 'object'
    ? godchild.patron_saint
    : null

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 text-white/40 text-sm">
        Bonjour, {godchild.name} ✝
      </div>

      {latestBrique ? (
        <>
          <BriqueCard brique={latestBrique} />
          <ReactionStrip
            briqueId={latestBrique.id}
            godchildId={godchild.id}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/40">
          <p className="font-serif text-lg">
            {patronSaint?.name
              ? `Que ${patronSaint.name} t'accompagne.`
              : 'Bienvenue.'}
          </p>
        </div>
      )}

      <NavGrid
        slug={params.slug}
        token={params.token}
        patronSaintName={patronSaint?.name}
      />

      <div className="mt-4 text-center">
        <a
          href={`/${params.slug}/${params.token}/briques`}
          className="text-xs text-white/30 hover:text-white/50"
        >
          Voir toutes les briques →
        </a>
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Verify dashboard renders**

```bash
npm run dev
```

1. Go to Payload admin (`localhost:3000/admin`), create a test Godchild (name: Martin, slug: martin).
2. Copy the auto-generated token from the admin.
3. Visit `localhost:3000/martin/<token>`.
4. Expected: dashboard renders with "Bonjour, Martin ✝" and the nav grid.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: dashboard page with brique-first layout and reaction strip"
```

---

## Phase 4 — Chapelet

### Task 7: MysteryPicker Component + Chapelet Index Page

**Files:**
- Create: `components/MysteryPicker.tsx`
- Create: `app/[slug]/[token]/chapelet/page.tsx`

- [ ] **Step 1: Create `components/MysteryPicker.tsx`**

```typescript
import Link from 'next/link'
import { getMysteryTypeForDay } from '@/lib/mystery-of-day'

const MYSTERY_TYPES = [
  { key: 'joyeux',     label: 'Mystères Joyeux',     subtitle: 'Enfance du Christ',          days: 'Lundi, Samedi',   icon: '🌸' },
  { key: 'lumineux',   label: 'Mystères Lumineux',   subtitle: 'Vie publique de Jésus',      days: 'Jeudi',           icon: '☀️' },
  { key: 'douloureux', label: 'Mystères Douloureux', subtitle: 'Passion et mort sur la croix', days: 'Mardi, Vendredi', icon: '✝️' },
  { key: 'glorieux',   label: 'Mystères Glorieux',   subtitle: 'Résurrection et suites',     days: 'Mercredi, Dimanche', icon: '👑' },
]

export function MysteryPicker({
  slug,
  token,
  todayType,
}: {
  slug: string
  token: string
  todayType: string
}) {
  const base = `/${slug}/${token}/chapelet`
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-white/50 mb-2">Quelle famille de mystères voulez-vous prier ?</p>
      {MYSTERY_TYPES.map(({ key, label, subtitle, days, icon }) => {
        const isToday = key === todayType
        return (
          <Link
            key={key}
            href={`${base}/${key}`}
            className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
              isToday
                ? 'border-violet-500 bg-violet-950/30 text-violet-200'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className={`font-medium ${isToday ? 'text-violet-300' : ''}`}>{label}</div>
                <div className="text-xs text-white/40">{subtitle} — {days}</div>
                {isToday && (
                  <div className="text-xs text-violet-400 mt-0.5">✦ Aujourd'hui</div>
                )}
              </div>
            </div>
            <span className="text-white/30">›</span>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create `app/[slug]/[token]/chapelet/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getTodaysMysteryType } from '@/lib/mystery-of-day'
import { MysteryPicker } from '@/components/MysteryPicker'
import Link from 'next/link'

export default async function ChapeletPage({
  params,
}: {
  params: { slug: string; token: string }
}) {
  const godchild = await resolveGodchild(params.slug, params.token)
  if (!godchild) notFound()

  const todayType = getTodaysMysteryType()

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${params.slug}/${params.token}`} className="text-white/40 hover:text-white/70">←</Link>
        <h1 className="text-lg font-semibold">Chapelet</h1>
      </div>
      <MysteryPicker slug={params.slug} token={params.token} todayType={todayType} />
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: chapelet index with mystery picker and today highlight"
```

---

### Task 8: Mystery Detail Page (Accordions + Reading Filter)

**Files:**
- Create: `components/MysteryAccordion.tsx`
- Create: `components/ReadingPicker.tsx`
- Create: `app/[slug]/[token]/chapelet/[type]/page.tsx`
- Create: `__tests__/components/MysteryAccordion.test.tsx`

- [ ] **Step 1: Write failing tests for reading filter logic**

Create `__tests__/components/MysteryAccordion.test.tsx`:

```typescript
import { filterReadings } from '@/components/MysteryAccordion'

describe('filterReadings', () => {
  const readings = [
    { source_key: 'st-luc', source_label: 'Saint Luc', content: {} },
    { source_key: 'st-marc', source_label: 'Saint Marc', content: {} },
    { source_key: 'sainte-rita', source_label: 'Sainte Rita', content: {} },
  ]

  it('returns only readings matching allowed_sources', () => {
    const allowed = ['st-luc', 'st-marc']
    const result = filterReadings(readings, allowed)
    expect(result).toHaveLength(2)
    expect(result.map(r => r.source_key)).toEqual(['st-luc', 'st-marc'])
  })

  it('returns empty array when allowed_sources is empty', () => {
    expect(filterReadings(readings, [])).toHaveLength(0)
  })

  it('returns all readings that match', () => {
    const allowed = ['st-luc', 'st-marc', 'sainte-rita']
    expect(filterReadings(readings, allowed)).toHaveLength(3)
  })

  it('returns empty array when no sources match', () => {
    expect(filterReadings(readings, ['st-matthieu'])).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/MysteryAccordion.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/MysteryAccordion'`

- [ ] **Step 3: Create `components/ReadingPicker.tsx`**

```typescript
'use client'
import { useState } from 'react'

type Reading = {
  source_key: string
  source_label: string
  content: any
}

function RichText({ content }: { content: any }) {
  if (!content?.root?.children) return null
  return (
    <div className="prose prose-invert prose-sm max-w-none font-serif">
      {content.root.children.map((node: any, i: number) => {
        if (node.type === 'paragraph') {
          return <p key={i}>{node.children?.map((c: any) => c.text).join('')}</p>
        }
        return null
      })}
    </div>
  )
}

export function ReadingPicker({ readings }: { readings: Reading[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedReading = readings.find(r => r.source_key === selected)

  if (readings.length === 0) {
    return <p className="text-xs text-white/30 italic">Aucune lecture disponible.</p>
  }

  return (
    <div>
      <p className="text-xs text-white/40 mb-2">Choisir une méditation :</p>
      <div className="flex flex-col gap-1.5 mb-3">
        {readings.map(r => (
          <button
            key={r.source_key}
            onClick={() => setSelected(selected === r.source_key ? null : r.source_key)}
            className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
              selected === r.source_key
                ? 'bg-violet-900/50 border border-violet-500 text-violet-200'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            📖 {r.source_label}
          </button>
        ))}
      </div>
      {selectedReading && (
        <div className="border-l-2 border-violet-500 pl-4">
          <RichText content={selectedReading.content} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `components/MysteryAccordion.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { ReadingPicker } from './ReadingPicker'

type Reading = {
  source_key: string
  source_label: string
  content: any
}

type Mystery = {
  id: string | number
  name: string
  fruit: string
  readings: Reading[]
  audio_meditation?: any
}

// Exported for testing
export function filterReadings(readings: Reading[], allowedSources: string[]): Reading[] {
  return readings.filter(r => allowedSources.includes(r.source_key))
}

export function MysteryAccordion({
  mystery,
  allowedSources,
  index,
}: {
  mystery: Mystery
  allowedSources: string[]
  index: number
}) {
  const [open, setOpen] = useState(false)
  const visibleReadings = filterReadings(mystery.readings ?? [], allowedSources)

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div>
          <div className="font-medium">
            {index}. {mystery.name}
          </div>
          <div className="text-xs text-white/40 mt-0.5">Fruit : {mystery.fruit}</div>
        </div>
        <span className="text-white/30 ml-4">{open ? '▼' : '›'}</span>
      </button>

      {open && (
        <div className="border-t border-white/10 p-4">
          <ReadingPicker readings={visibleReadings} />
          {mystery.audio_meditation && (
            <div className="mt-4">
              <p className="text-xs text-white/40 mb-1">▶ Méditation audio</p>
              <audio
                controls
                src={
                  typeof mystery.audio_meditation === 'object'
                    ? mystery.audio_meditation.url
                    : undefined
                }
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- __tests__/components/MysteryAccordion.test.tsx
```

Expected: PASS — 4 tests passing

- [ ] **Step 6: Create `app/[slug]/[token]/chapelet/[type]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { MysteryAccordion } from '@/components/MysteryAccordion'
import Link from 'next/link'
import type { Mystery, Godchild } from '@/payload-types'

const TYPE_LABELS: Record<string, string> = {
  joyeux: 'Mystères Joyeux',
  douloureux: 'Mystères Douloureux',
  glorieux: 'Mystères Glorieux',
  lumineux: 'Mystères Lumineux',
}

export default async function ChapeletTypePage({
  params,
}: {
  params: { slug: string; token: string; type: string }
}) {
  if (!TYPE_LABELS[params.type]) notFound()

  const godchild = await resolveGodchild(params.slug, params.token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

  // Fetch mysteries for this type, sorted by order
  const mysteriesResult = await payload.find({
    collection: 'mysteries',
    where: { mystery_type: { equals: params.type } },
    sort: 'order',
    limit: 5,
    depth: 0,
  })

  const mysteries = mysteriesResult.docs as Mystery[]
  if (mysteries.length === 0) notFound()

  const allowedSources = (godchild.allowed_sources ?? []).map(
    (s: any) => s.source_key ?? s
  )

  // Introduction is on the first mystery (they all share it by type)
  // Store introduction at the mystery_type level — use the first mystery's intro
  const introduction = mysteries[0]?.introduction

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${params.slug}/${params.token}/chapelet`} className="text-white/40 hover:text-white/70">←</Link>
        <h1 className="text-lg font-semibold">{TYPE_LABELS[params.type]}</h1>
      </div>

      {introduction && (
        <blockquote className="border-l-2 border-white/20 pl-4 mb-8 text-sm font-serif text-white/60 italic leading-relaxed">
          <IntroText content={introduction} />
        </blockquote>
      )}

      <div className="flex flex-col gap-3">
        {mysteries.map((mystery, i) => (
          <MysteryAccordion
            key={mystery.id}
            mystery={mystery as any}
            allowedSources={allowedSources}
            index={i + 1}
          />
        ))}
      </div>
    </main>
  )
}

function IntroText({ content }: { content: any }) {
  if (!content?.root?.children) return null
  return (
    <>
      {content.root.children.map((node: any, i: number) => {
        if (node.type === 'paragraph') {
          return <p key={i} className="mb-2">{node.children?.map((c: any) => c.text).join('')}</p>
        }
        return null
      })}
    </>
  )
}
```

> Note: The `introduction` field is stored on each `Mystery` document. Since the introduction belongs to the *mystery type* (not individual mysteries), store it only on the first mystery (order: 1) of each type in Payload. The page reads `mysteries[0].introduction` — this is a CMS data convention, not a code problem.

- [ ] **Step 7: Verify chapelet works end-to-end**

```bash
npm run dev
```

1. In Payload admin, create one mystery: mystery_type=douloureux, order=1, name="L'agonie au jardin", fruit="Regret de nos fautes". Add a reading: source_key=st-luc, source_label="Évangile selon Saint Luc", some content.
2. Set Martin's `allowed_sources` to `[{ source_key: "st-luc" }]`.
3. Visit `localhost:3000/martin/<token>/chapelet`.
4. Click Mystères Douloureux → see intro + accordion.
5. Open accordion → see "Évangile selon Saint Luc" reading.
6. Expected: reading expands inline.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: chapelet detail page with per-godchild reading filter"
```

---

## Phase 5 — Remaining Pages

### Task 9: Prières Page

**Files:**
- Create: `components/PrayerItem.tsx`
- Create: `app/[slug]/[token]/prieres/page.tsx`

- [ ] **Step 1: Create `components/PrayerItem.tsx`**

```typescript
'use client'
import { useState } from 'react'
import type { Prayer } from '@/payload-types'

function RichText({ content }: { content: any }) {
  if (!content?.root?.children) return null
  return (
    <div className="prose prose-invert prose-sm max-w-none font-serif">
      {content.root.children.map((node: any, i: number) => (
        node.type === 'paragraph'
          ? <p key={i}>{node.children?.map((c: any) => c.text).join('')}</p>
          : null
      ))}
    </div>
  )
}

export function PrayerItem({ prayer }: { prayer: Prayer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium">{prayer.title}</span>
        <span className="text-white/30">{open ? '▼' : '›'}</span>
      </button>
      {open && (
        <div className="border-t border-white/10 p-4">
          <RichText content={prayer.content} />
          {prayer.audio && typeof prayer.audio === 'object' && prayer.audio.url && (
            <audio controls src={prayer.audio.url} className="w-full mt-4" />
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `app/[slug]/[token]/prieres/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { PrayerItem } from '@/components/PrayerItem'
import Link from 'next/link'
import type { Prayer } from '@/payload-types'

const CATEGORY_LABELS: Record<string, string> = {
  base: 'Prières de base',
  chapelet: 'Chapelet',
  angelus: 'Angélus',
  intercession: 'Intercessions',
  litanie: 'Litanies',
}

export default async function PrieresPage({
  params,
}: {
  params: { slug: string; token: string }
}) {
  const godchild = await resolveGodchild(params.slug, params.token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'prayers',
    limit: 100,
    sort: 'category',
    depth: 1,
  })

  const prayers = result.docs as Prayer[]

  // Group by category
  const grouped = prayers.reduce<Record<string, Prayer[]>>((acc, p) => {
    const cat = p.category ?? 'base'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${params.slug}/${params.token}`} className="text-white/40 hover:text-white/70">←</Link>
        <h1 className="text-lg font-semibold">Prières</h1>
      </div>

      {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
        const items = grouped[cat]
        if (!items?.length) return null
        return (
          <section key={cat} className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">{label}</h2>
            <div className="flex flex-col gap-2">
              {items.map(p => <PrayerItem key={p.id} prayer={p} />)}
            </div>
          </section>
        )
      })}
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: prières page grouped by category"
```

---

### Task 10: Saint Patron + Briques Archive

**Files:**
- Create: `app/[slug]/[token]/saint/page.tsx`
- Create: `app/[slug]/[token]/briques/page.tsx`

- [ ] **Step 1: Create `app/[slug]/[token]/saint/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { PrayerItem } from '@/components/PrayerItem'
import Link from 'next/link'
import type { Saint, Prayer } from '@/payload-types'

export default async function SaintPage({
  params,
}: {
  params: { slug: string; token: string }
}) {
  const godchild = await resolveGodchild(params.slug, params.token)
  if (!godchild) notFound()

  const patronSaint = typeof godchild.patron_saint === 'object'
    ? godchild.patron_saint as Saint
    : null

  if (!patronSaint) {
    return (
      <main className="max-w-md mx-auto px-4 py-8 text-center text-white/40">
        <p>Aucun saint patron assigné.</p>
        <Link href={`/${params.slug}/${params.token}`} className="text-xs mt-4 block hover:text-white/60">← Retour</Link>
      </main>
    )
  }

  const payload = await getPayloadClient()
  const saintResult = await payload.findByID({
    collection: 'saints',
    id: patronSaint.id,
    depth: 2,
  })

  const saint = saintResult as Saint
  const prayers = (saint.prayers ?? []) as Prayer[]

  const today = new Date()
  const todayMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const isFeastDay = saint.feast_day === todayMMDD

  const imageUrl = typeof saint.image === 'object' && saint.image?.url ? saint.image.url : null

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${params.slug}/${params.token}`} className="text-white/40 hover:text-white/70">←</Link>
        <h1 className="text-lg font-semibold">{saint.name}</h1>
      </div>

      {isFeastDay && (
        <div className="mb-4 rounded-xl border border-yellow-500/50 bg-yellow-950/30 p-3 text-center text-yellow-300 text-sm">
          ✦ Fête de {saint.name} aujourd'hui
        </div>
      )}

      {imageUrl && (
        <img src={imageUrl} alt={saint.name} className="w-full rounded-xl mb-6 object-cover max-h-64" />
      )}

      {saint.description && (
        <div className="prose prose-invert prose-sm max-w-none font-serif mb-8 text-white/70">
          <DescriptionText content={saint.description} />
        </div>
      )}

      {prayers.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Prières</h2>
          <div className="flex flex-col gap-2">
            {prayers.map(p => <PrayerItem key={p.id} prayer={p} />)}
          </div>
        </section>
      )}
    </main>
  )
}

function DescriptionText({ content }: { content: any }) {
  if (!content?.root?.children) return null
  return (
    <>
      {content.root.children.map((node: any, i: number) => (
        node.type === 'paragraph'
          ? <p key={i}>{node.children?.map((c: any) => c.text).join('')}</p>
          : null
      ))}
    </>
  )
}
```

- [ ] **Step 2: Create `app/[slug]/[token]/briques/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { BriqueCard } from '@/components/BriqueCard'
import Link from 'next/link'
import type { Brique } from '@/payload-types'

export default async function BriquesPage({
  params,
}: {
  params: { slug: string; token: string }
}) {
  const godchild = await resolveGodchild(params.slug, params.token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'briques',
    where: {
      and: [
        { published: { equals: true } },
        {
          or: [
            { target: { equals: godchild.id } },
            { target: { exists: false } },
          ],
        },
      ],
    },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
  })

  // Fetch read_at for each brique
  const feedbackResult = await payload.find({
    collection: 'feedback',
    where: { godchild: { equals: godchild.id } },
    limit: 100,
  })

  const readMap = new Map(
    feedbackResult.docs.map(f => [
      typeof f.brique === 'object' ? f.brique.id : f.brique,
      f.read_at,
    ])
  )

  const briques = result.docs as Brique[]

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${params.slug}/${params.token}`} className="text-white/40 hover:text-white/70">←</Link>
        <h1 className="text-lg font-semibold">Briques</h1>
      </div>

      {briques.length === 0 && (
        <p className="text-white/40 text-sm">Aucune brique publiée pour l'instant.</p>
      )}

      <div className="flex flex-col gap-4">
        {briques.map(b => (
          <div key={b.id} className="relative">
            {!readMap.has(b.id) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-500 z-10" />
            )}
            <BriqueCard brique={b} />
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: saint patron page and briques archive"
```

---

## Phase 6 — PWA & Push Notifications

### Task 11: PWA Manifest, Push Subscription, and Vercel Deploy

**Files:**
- Create: `app/api/push/subscribe/route.ts`
- Modify: `app/[slug]/[token]/layout.tsx`
- Create: `public/sw-custom.js` (optional — for push handler)

- [ ] **Step 1: Create push subscription API route**

`app/api/push/subscribe/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const { godchildId, subscription } = await req.json()
  if (!godchildId || !subscription) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'godchildren',
    id: godchildId,
    data: { push_subscription: subscription },
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Add push permission request to godchild layout**

Update `app/[slug]/[token]/layout.tsx` — add the push prompt client component:

```typescript
// Add to imports
import { PushPrompt } from '@/components/PushPrompt'

// Add inside the returned JSX, after the children:
// <PushPrompt godchildId={godchild.id} />
```

Create `components/PushPrompt.tsx`:

```typescript
'use client'
import { useEffect } from 'react'

export function PushPrompt({ godchildId }: { godchildId: string | number }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'granted') return

    // Prompt once, stored in localStorage
    const prompted = localStorage.getItem('push-prompted')
    if (prompted) return

    const timer = setTimeout(async () => {
      localStorage.setItem('push-prompted', '1')
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ godchildId, subscription }),
      })
    }, 5000) // wait 5s after load

    return () => clearTimeout(timer)
  }, [godchildId])

  return null
}
```

Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your VAPID public key>` to `.env.local`.

- [ ] **Step 3: Add push sender utility (for your use from admin/scripts)**

Create `lib/push.ts`:

```typescript
import webpush from 'web-push'
import { getPayloadClient } from './payload'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function sendPushToBrique(briqueId: string | number) {
  const payload = await getPayloadClient()

  const brique = await payload.findByID({ collection: 'briques', id: briqueId })

  // Find godchildren who should receive this
  const where = brique.target
    ? { id: { equals: typeof brique.target === 'object' ? brique.target.id : brique.target } }
    : { active: { equals: true } }

  const godchildren = await payload.find({
    collection: 'godchildren',
    where,
    limit: 100,
  })

  for (const godchild of godchildren.docs) {
    if (!godchild.push_subscription) continue
    try {
      await webpush.sendNotification(
        godchild.push_subscription as any,
        JSON.stringify({
          title: 'Sainteté',
          body: brique.title,
          icon: '/icons/icon-192.png',
        }),
      )
    } catch (err) {
      console.error(`Push failed for ${godchild.name}:`, err)
    }
  }
}
```

- [ ] **Step 4: Verify PWA installability**

```bash
npm run build && npm start
```

1. Open `localhost:3000/martin/<token>` in Chrome.
2. Open DevTools → Application → Manifest. Verify: name, icons, display=standalone.
3. In Chrome: three-dot menu → "Install Sainteté". Should work.
4. On iPhone: open in Safari → Share → "Sur l'écran d'accueil".

- [ ] **Step 5: Deploy to Vercel**

```bash
# Install Vercel CLI if needed
npm install -g vercel

vercel
```

Follow prompts. Then in Vercel dashboard:
- Add environment variables: `DATABASE_URI`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Enable Neon Postgres via Vercel integration (Storage tab → Add → Neon)
- Set `DATABASE_URI` to the Neon connection string

Run migration on production:
```bash
DATABASE_URI=<prod-uri> PAYLOAD_SECRET=<secret> npx payload migrate
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: PWA push notifications and Vercel deploy config"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Token URL auth — Task 3 (lib/auth.ts + middleware)
- [x] 6 Payload collections — Task 2
- [x] Dashboard brique-first — Task 6
- [x] Reaction strip → Feedback API — Tasks 6 + 6 step 4
- [x] Chapelet picker with today highlight — Task 7
- [x] Intro text per mystery type — Task 8 (reads `mysteries[0].introduction`)
- [x] Mystery accordions — Task 8
- [x] Per-godchild reading filter — Task 8 (filterReadings + allowed_sources)
- [x] Prières grouped by category — Task 9
- [x] Saint patron page with feast day banner — Task 10
- [x] Briques archive with unread indicator — Task 10
- [x] PWA manifest + Web Push — Task 11
- [x] Token auto-generation — Task 2 (Godchildren.ts beforeChange hook)
- [x] `push_subscription` field — Task 2 (Godchildren.ts)

**Spec item noted but not in tasks:**
- Offline service worker cache for prayers: handled automatically by `@ducanh2912/next-pwa` with default cache strategy. No custom config needed for MVP.
- Dynamic manifest per godchild (theme_color): deferred — the static `public/manifest.json` uses violet as default. Per-godchild dynamic manifest can be added post-MVP as a Next.js route.

**Type consistency check:**
- `filterReadings` — defined and exported in `MysteryAccordion.tsx`, imported in tests ✓
- `resolveGodchild` — defined in `lib/auth.ts`, used in all page files ✓
- `getPayloadClient` — defined in `lib/payload.ts`, used across pages and API routes ✓
- `allowed_sources` in Payload schema is `array` of `{ source_key: string }` — Task 8 page unwraps with `.map(s => s.source_key ?? s)` ✓
- `Brique`, `Saint`, `Prayer`, `Mystery`, `Godchild` — all from `@/payload-types` (auto-generated in Task 2 step 8) ✓
