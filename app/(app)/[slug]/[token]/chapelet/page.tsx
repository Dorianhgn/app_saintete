import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { getTodaysMysteryType } from '@/lib/mystery-of-day'
import { MysteryPicker } from '@/components/MysteryPicker'
import Link from 'next/link'

export default async function ChapeletPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()
  const config = await payload.findGlobal({ slug: 'prayer-page-config', depth: 0 }) as any

  const todayType = getTodaysMysteryType()

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}`} className="text-[var(--text-muted)] hover:text-[var(--text)]">←</Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">Chapelet</h1>
      </div>

      <Link
        href={`/${slug}/${token}/chapelet/catechese`}
        className="block mb-6 p-4 bg-[var(--bg-muted)] border-l-4 border-[var(--accent)] rounded-r-xl hover:opacity-90 transition-opacity"
      >
        <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-1">Catéchèse</p>
        <p className="font-serif text-[var(--text)]">{config?.chapelet_catechese_title ?? 'Comment prier le chapelet'}</p>
      </Link>

      <MysteryPicker slug={slug} token={token} todayType={todayType} />
    </main>
  )
}
