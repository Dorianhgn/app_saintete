import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { PrayerItem } from '@/components/PrayerItem'
import Link from 'next/link'
import type { Prayer } from '@/payload-types'

const CATEGORY_LABELS: Record<string, string> = {
  base:        'Prières de base',
  chapelet:    'Chapelet',
  angelus:     'Angélus',
  intercession: 'Intercessions',
  litanie:     'Litanies',
}

export default async function PrieresPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'prayers',
    limit: 100,
    sort: 'category',
    depth: 1,
  })

  const prayers = result.docs as Prayer[]

  const grouped = prayers.reduce<Record<string, Prayer[]>>((acc, p) => {
    const cat = p.category ?? 'base'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}`} className="text-white/40 hover:text-white/70">←</Link>
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
