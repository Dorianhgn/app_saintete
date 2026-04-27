import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { PushPrompt } from '@/components/PushPrompt'
import { CSSProperties } from 'react'

const LITURGY_COLORS: Record<string, string> = {
  violet: '#6B3FA0',
  vert: '#2E7D32',
  rouge: '#B71C1C',
  or: '#EFBF04',
  blanc: '#F7EF8A',
}

export default async function GodchildLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = await params
  const godchild = await resolveGodchild(slug, token)
  if (!godchild) notFound()

  const liturgyColor = LITURGY_COLORS[godchild.theme_color ?? 'violet'] ?? '#6B3FA0'

  return (
    <div style={{ '--liturgy': liturgyColor } as CSSProperties} className="min-h-screen">
      {children}
      <PushPrompt godchildId={godchild.id} />
    </div>
  )
}
