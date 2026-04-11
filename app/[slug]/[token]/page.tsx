import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { BriqueCard } from '@/components/BriqueCard'
import { ReactionStrip } from '@/components/ReactionStrip'
import { NavGrid } from '@/components/NavGrid'
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
        slug={slug}
        token={token}
        patronSaintName={patronSaint?.name}
      />

      <div className="mt-4 text-center">
        <a
          href={`/${slug}/${token}/briques`}
          className="text-xs text-white/30 hover:text-white/50"
        >
          Voir toutes les briques →
        </a>
      </div>
    </main>
  )
}
