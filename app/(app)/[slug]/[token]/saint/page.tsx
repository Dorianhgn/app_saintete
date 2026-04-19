import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { PrayerItem } from '@/components/PrayerItem'
import Link from 'next/link'
import type { Saint, Prayer } from '@/payload-types'

function DescriptionText({ content }: { content: unknown }) {
  const c = content as { root?: { children?: Array<{ type: string; children?: Array<{ text: string }> }> } }
  if (!c?.root?.children) return null
  return (
    <>
      {c.root.children.map((node, i) => (
        node.type === 'paragraph'
          ? <p key={i}>{node.children?.map((child) => child.text).join('')}</p>
          : null
      ))}
    </>
  )
}

export default async function SaintPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const patronSaint = typeof godchild.patron_saint === 'object' && godchild.patron_saint !== null
    ? godchild.patron_saint as Saint
    : null

  if (!patronSaint) {
    return (
      <main className="max-w-md mx-auto px-4 py-8 text-center text-[var(--text-muted)]">
        <p>Aucun saint patron assigné.</p>
        <Link href={`/${slug}/${token}`} className="text-xs mt-4 block text-[var(--text-muted)] hover:text-[var(--text)]">← Retour</Link>
      </main>
    )
  }

  const payload = await getPayloadClient()
  const saint = await payload.findByID({
    collection: 'saints',
    id: patronSaint.id,
    depth: 2,
  }) as Saint

  const prayers = (saint.prayers ?? []) as Prayer[]

  const today = new Date()
  const todayMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const isFeastDay = saint.feast_day === todayMMDD

  const imageUrl = typeof saint.image === 'object' && saint.image !== null
    ? (saint.image as { url?: string }).url ?? null
    : null

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}`} className="text-[var(--text-muted)] hover:text-[var(--text)]">←</Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">{saint.name}</h1>
      </div>

      {isFeastDay && (
        <div className="mb-4 rounded-xl border border-[var(--accent)]/50 bg-[var(--bg-muted)] p-3 text-center text-[var(--accent)] text-sm">
          ✦ Fête de {saint.name} aujourd&apos;hui
        </div>
      )}

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={saint.name} className="w-full rounded-xl mb-6 object-cover max-h-64" />
      )}

      {saint.description != null && (
        <div className="prose prose-sm max-w-none font-serif mb-8 text-[var(--text-muted)]">
          <DescriptionText content={saint.description} />
        </div>
      )}

      {prayers.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">Prières</h2>
          <div className="flex flex-col gap-2">
            {prayers.map(p => <PrayerItem key={p.id} prayer={p} />)}
          </div>
        </section>
      )}
    </main>
  )
}
