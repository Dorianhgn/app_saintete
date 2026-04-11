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
      <main className="max-w-md mx-auto px-4 py-8 text-center text-white/40">
        <p>Aucun saint patron assigné.</p>
        <Link href={`/${slug}/${token}`} className="text-xs mt-4 block hover:text-white/60">← Retour</Link>
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
        <Link href={`/${slug}/${token}`} className="text-white/40 hover:text-white/70">←</Link>
        <h1 className="text-lg font-semibold">{saint.name}</h1>
      </div>

      {isFeastDay && (
        <div className="mb-4 rounded-xl border border-yellow-500/50 bg-yellow-950/30 p-3 text-center text-yellow-300 text-sm">
          ✦ Fête de {saint.name} aujourd&apos;hui
        </div>
      )}

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
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
