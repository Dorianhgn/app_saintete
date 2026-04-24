import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { BriqueCard } from '@/components/BriqueCard'
import Link from 'next/link'
import type { Brique, Feedback } from '@/payload-types'

export default async function BriquesPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
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

  const feedbackResult = await payload.find({
    collection: 'feedback',
    where: { godchild: { equals: godchild.id } },
    limit: 100,
  })

  const readMap = new Map(
    (feedbackResult.docs as Feedback[]).map(f => [
      typeof f.brique === 'object' && f.brique !== null ? (f.brique as Brique).id : f.brique,
      f.read_at,
    ])
  )

  const briques = result.docs as Brique[]

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}`} className="text-[var(--text-muted)] hover:text-[var(--text)]">←</Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">Briques</h1>
      </div>

      {briques.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm">Aucune brique publiée pour l&apos;instant.</p>
      )}

      <div className="flex flex-col gap-4">
        {briques.map(b => (
          <div key={b.id} className="relative">
            {!readMap.has(b.id) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent)] z-10" />
            )}
            <BriqueCard brique={b} />
          </div>
        ))}
      </div>
    </main>
  )
}
