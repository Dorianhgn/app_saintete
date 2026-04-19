import { notFound } from 'next/navigation'
import Link from 'next/link'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { BriqueCard } from '@/components/BriqueCard'
import { NavGrid } from '@/components/NavGrid'
import { PinnedPrayers } from '@/components/PinnedPrayers'
import type { Brique } from '@/payload-types'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

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

  const patronSaint = typeof godchild.patron_saint === 'object' && godchild.patron_saint !== null
    ? godchild.patron_saint as { name: string }
    : null

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 text-[var(--text-muted)] text-sm">
        Bonjour, {godchild.name} ✝
      </div>

      {latestBrique ? (
        <>
          <Link href={`/${slug}/${token}/briques/${latestBrique.id}`}>
            <BriqueCard brique={latestBrique} />
          </Link>
          <p className="text-xs text-[var(--text-muted)] mt-2 text-right">Lire et réagir →</p>
        </>
      ) : (
        <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-2xl p-6 text-center text-[var(--text-muted)]">
          <p className="font-serif text-lg">
            {patronSaint?.name
              ? `Que ${patronSaint.name} t'accompagne.`
              : 'Bienvenue.'}
          </p>
        </div>
      )}

      <PinnedPrayers slug={slug} token={token} />

      <NavGrid
        slug={slug}
        token={token}
        patronSaintName={patronSaint?.name}
      />

      <div className="mt-4 text-center">
        <a
          href={`/${slug}/${token}/briques`}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Voir toutes les briques →
        </a>
      </div>
    </main>
  )
}
