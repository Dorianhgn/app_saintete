import type { Brique } from '@/payload-types'

function RichText({ content }: { content: unknown }) {
  const c = content as { root?: { children?: Array<{ type: string; children?: Array<{ text: string }> }> } }
  if (!c?.root?.children) return null
  return (
    <div>
      {c.root.children.map((node, i) => {
        if (node.type === 'paragraph') {
          return <p key={i}>{node.children?.map((child) => child.text).join('')}</p>
        }
        return null
      })}
    </div>
  )
}

export function BriqueCard({ brique }: { brique: Brique }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-1 text-xs uppercase tracking-widest text-white/40">
        ✦ Brique du jour
      </div>
      <h2 className="mb-4 text-xl font-serif font-semibold">{brique.title}</h2>
      {brique.type === 'audio' && brique.audio_file ? (
        <audio
          controls
          src={typeof brique.audio_file === 'object' && brique.audio_file !== null ? (brique.audio_file as { url?: string }).url ?? '' : ''}
          className="w-full"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none font-serif">
          <RichText content={brique.content} />
        </div>
      )}
    </div>
  )
}
