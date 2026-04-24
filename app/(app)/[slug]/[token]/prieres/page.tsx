import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import type { PrayerCategory } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { appConverters } from '@/lib/richTextConverters'

export default async function PrieresPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

  const [configResult, categoriesResult] = await Promise.all([
    payload.findGlobal({ slug: 'prayer-page-config', depth: 0 }) as Promise<any>,
    payload.find({ collection: 'prayer-categories', sort: 'order', limit: 50 }),
  ])

  const config = configResult
  const categories = categoriesResult.docs as PrayerCategory[]

  const counts = await Promise.all(
    categories.map((cat) =>
      payload.count({ collection: 'prayers', where: { category: { equals: cat.id } } })
    )
  )

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}`} className="text-[var(--text-muted)] hover:text-[var(--text)]">←</Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">Prières</h1>
      </div>

      {config?.intro_text && (
        <div className="border-l-4 border-[var(--border)] pl-4 mb-6 italic text-[var(--text-muted)] font-serif text-sm">
          <RichText data={config.intro_text as any} disableContainer converters={appConverters} />
        </div>
      )}

      <Link
        href={`/${slug}/${token}/prieres/catechese`}
        className="block mb-6 p-4 bg-[var(--bg-muted)] border-l-4 border-[var(--accent)] rounded-r-xl hover:opacity-90 transition-opacity"
      >
        <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-1">Catéchèse</p>
        <p className="font-serif text-[var(--text)]">{config?.catechese_title ?? "Qu'est-ce que la prière ?"}</p>
      </Link>

      <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">Rubriques</p>

      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/${slug}/${token}/prieres/${cat.slug}`}
          className="flex justify-between items-center p-4 bg-[var(--bg-card)] border border-[var(--border)] border-l-[3px] border-l-[var(--liturgy)] rounded-[0_10px_10px_0] mb-3 hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <span className="font-serif text-[var(--text)]">{cat.name}</span>
          <span className="text-xs text-[var(--text-muted)]">{counts[i]?.totalDocs ?? 0} prières</span>
        </Link>
      ))}
    </main>
  )
}
