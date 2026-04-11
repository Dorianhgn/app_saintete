'use client'
import { useState } from 'react'

type Reading = {
  source_key: string
  source_label: string
  content: unknown
}

function RichText({ content }: { content: unknown }) {
  const c = content as { root?: { children?: Array<{ type: string; children?: Array<{ text: string }> }> } }
  if (!c?.root?.children) return null
  return (
    <div className="prose prose-invert prose-sm max-w-none font-serif">
      {c.root.children.map((node, i) => {
        if (node.type === 'paragraph') {
          return <p key={i}>{node.children?.map((child) => child.text).join('')}</p>
        }
        return null
      })}
    </div>
  )
}

export function ReadingPicker({ readings }: { readings: Reading[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedReading = readings.find(r => r.source_key === selected)

  if (readings.length === 0) {
    return <p className="text-xs text-white/30 italic">Aucune lecture disponible.</p>
  }

  return (
    <div>
      <p className="text-xs text-white/40 mb-2">Choisir une méditation :</p>
      <div className="flex flex-col gap-1.5 mb-3">
        {readings.map(r => (
          <button
            key={r.source_key}
            onClick={() => setSelected(selected === r.source_key ? null : r.source_key)}
            className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
              selected === r.source_key
                ? 'bg-violet-900/50 border border-violet-500 text-violet-200'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            📖 {r.source_label}
          </button>
        ))}
      </div>
      {selectedReading && (
        <div className="border-l-2 border-violet-500 pl-4">
          <RichText content={selectedReading.content} />
        </div>
      )}
    </div>
  )
}
