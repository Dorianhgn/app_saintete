import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { PrayerItem } from '@/components/PrayerItem'
import Link from 'next/link'
import type { Prayer, PrayerCategory } from '@/payload-types'

export default async function CategoryPrayersPage({
  params,
}: {
  params: Promise<{ slug: string; token: string; categorySlug: string }>
}) {
  const { slug, token, categorySlug } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

  const categoryResult = await payload.find({
    collection: 'prayer-categories',
    where: { slug: { equals: categorySlug } },
    limit: 1,
  })

  if (!categoryResult.docs.length) notFound()
  const category = categoryResult.docs[0] as PrayerCategory

  const prayersResult = await payload.find({
    collection: 'prayers',
    where: { category: { equals: category.id } },
    sort: 'title',
    limit: 100,
    depth: 1,
  })

  const prayers = prayersResult.docs as Prayer[]

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}/prieres`} className="text-[var(--text-muted)] hover:text-[var(--text)]">←</Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">{category.name}</h1>
      </div>

      {prayers.length === 0 ? (
        <p className="text-[var(--text-muted)] font-serif text-sm">Aucune prière dans cette rubrique.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {prayers.map((p) => (
            <PrayerItem key={p.id} prayer={p} slug={slug} />
          ))}
        </div>
      )}
    </main>
  )
}
