import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { MysteryAccordion } from '@/components/MysteryAccordion'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { appConverters } from '@/lib/richTextConverters'
import Link from 'next/link'
import type { Mystery } from '@/payload-types'

const TYPE_LABELS: Record<string, string> = {
  joyeux:     'Mystères Joyeux',
  douloureux: 'Mystères Douloureux',
  glorieux:   'Mystères Glorieux',
  lumineux:   'Mystères Lumineux',
}

export default async function ChapeletTypePage({
  params,
}: {
  params: Promise<{ slug: string; token: string; type: string }>
}) {
  const { slug, token, type } = await params

  if (!TYPE_LABELS[type]) notFound()

  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()

  const mysteriesResult = await payload.find({
    collection: 'mysteries',
    where: { mystery_type: { equals: type } },
    sort: 'order',
    limit: 5,
    depth: 0,
  })

  const mysteries = mysteriesResult.docs as Mystery[]
  if (mysteries.length === 0) notFound()

  const allowedSources = ((godchild.allowed_sources ?? []) as Array<{ source_key?: string } | string>).map(
    (s) => (typeof s === 'object' && s !== null ? (s as { source_key?: string }).source_key ?? '' : s)
  )

  const introduction = (mysteries[0] as Mystery & { introduction?: unknown }).introduction

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}/chapelet`} className="text-[var(--text-muted)] hover:text-[var(--text)]">←</Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">{TYPE_LABELS[type]}</h1>
      </div>

      {introduction != null && (
        <div className="border-l-2 border-l-[var(--liturgy)] pl-4 mb-8 text-sm font-serif text-[var(--text-muted)] italic leading-relaxed">
          <RichText data={introduction as any} disableContainer converters={appConverters} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {mysteries.map((mystery, i) => (
          <MysteryAccordion
            key={mystery.id}
            mystery={mystery as Parameters<typeof MysteryAccordion>[0]['mystery']}
            allowedSources={allowedSources}
            index={i + 1}
          />
        ))}
      </div>
    </main>
  )
}
