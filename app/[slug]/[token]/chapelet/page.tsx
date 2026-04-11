import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
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

  const todayType = getTodaysMysteryType()

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/${slug}/${token}`} className="text-white/40 hover:text-white/70">←</Link>
        <h1 className="text-lg font-semibold">Chapelet</h1>
      </div>
      <MysteryPicker slug={slug} token={token} todayType={todayType} />
    </main>
  )
}
