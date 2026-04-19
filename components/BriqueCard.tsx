import type { Brique } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'

export function BriqueCard({ brique }: { brique: Brique }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] border-l-[3px] border-l-[var(--liturgy)] bg-[var(--bg-card)] p-6 rounded-[0_10px_10px_0]">
      <div className="mb-1 text-xs uppercase tracking-widest text-[var(--accent)]">
        ✦ Brique du jour
      </div>
      <h2 className="mb-4 text-xl font-serif font-semibold text-[var(--text)]">{brique.title}</h2>
      {brique.type === 'audio' && brique.audio_file ? (
        <audio
          controls
          src={typeof brique.audio_file === 'object' && brique.audio_file !== null ? (brique.audio_file as { url?: string }).url ?? '' : ''}
          className="w-full"
        />
      ) : (
        <RichText
          data={brique.content as unknown as SerializedEditorState}
          className="prose prose-sm max-w-none font-serif text-[var(--text)]"
        />
      )}
    </div>
  )
}
