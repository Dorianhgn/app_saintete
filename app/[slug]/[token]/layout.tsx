import { notFound } from 'next/navigation'
import { resolveGodchild } from '@/lib/auth'
import { PushPrompt } from '@/components/PushPrompt'

// Color map for Tailwind accent classes
export const THEME_COLORS: Record<string, { accent: string; border: string; bg: string }> = {
  violet: { accent: 'text-violet-400', border: 'border-violet-500', bg: 'bg-violet-950/30' },
  blanc:  { accent: 'text-white',      border: 'border-white/40',   bg: 'bg-white/10' },
  vert:   { accent: 'text-green-400',  border: 'border-green-500',  bg: 'bg-green-950/30' },
  rouge:  { accent: 'text-red-400',    border: 'border-red-500',    bg: 'bg-red-950/30' },
  or:     { accent: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-950/30' },
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

  return (
    <div data-theme={godchild.theme_color ?? 'violet'} className="min-h-screen bg-zinc-950 text-white">
      {children}
      <PushPrompt godchildId={godchild.id} />
    </div>
  )
}
