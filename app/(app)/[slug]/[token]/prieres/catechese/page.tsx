import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { appConverters } from '@/lib/richTextConverters'

export default async function CatechesePage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const payload = await getPayloadClient()
  const config = await payload.findGlobal({ slug: 'prayer-page-config', depth: 0 }) as any

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}/prieres`} className="text-[var(--text-muted)] hover:text-[var(--text)]">←</Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">{"CATÉCHÈSE"}</h1>
      </div>
      <div className="font-serif text-[var(--text)] leading-relaxed prose prose-sm max-w-none">
        {config?.catechese_content && <RichText data={config.catechese_content as any} disableContainer converters={appConverters} />}
      </div>
    </main>
  )
}
