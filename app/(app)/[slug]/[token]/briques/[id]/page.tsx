import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import type { Brique } from '@/payload-types'
import { BriqueDetailFeedback } from './BriqueDetailFeedback'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default async function BriqueDetailPage({
  params,
}: {
  params: Promise<{ slug: string; token: string; id: string }>
}) {
  const { slug, token, id } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

  let brique: Brique | null = null
  try {
    brique = await payload.findByID({
      collection: 'briques',
      id,
      depth: 1,
    }) as Brique
  } catch {
    notFound()
  }

  if (!brique) notFound()

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${slug}/${token}`}
          className="text-[var(--text-muted)] hover:text-[var(--text)] text-sm"
        >
          ← Retour
        </Link>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] border-l-[3px] border-l-[var(--liturgy)] rounded-[0_10px_10px_0] p-6 mb-6">
        <h1 className="text-2xl font-serif font-semibold text-[var(--text)] mb-4">
          {brique.title}
        </h1>
        <RichText
          data={brique.content as any}
          className="font-serif leading-relaxed flex flex-col gap-3"
        />
      </div>

      <BriqueDetailFeedback briqueId={brique.id} godchildId={godchild.id} />
    </main>
  )
}
