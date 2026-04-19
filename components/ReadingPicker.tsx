'use client'
import { useState } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

type Reading = {
  source_key: string
  source_label: string
  content: unknown
}

export function ReadingPicker({ readings }: { readings: Reading[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedReading = readings.find(r => r.source_key === selected)

  if (readings.length === 0) {
    return <p className="text-xs text-[var(--text-muted)] italic">Aucune lecture disponible.</p>
  }

  return (
    <div>
      <p className="text-xs text-[var(--text-muted)] mb-2">Choisir une méditation :</p>
      <div className="flex flex-col gap-1.5 mb-3">
        {readings.map(r => (
          <button
            key={r.source_key}
            onClick={() => setSelected(selected === r.source_key ? null : r.source_key)}
            className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
              selected === r.source_key
                ? 'bg-[var(--bg-muted)] border border-[var(--accent)] text-[var(--accent)]'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            📖 {r.source_label}
          </button>
        ))}
      </div>
      {selectedReading && (
        <div className="border-l-2 border-l-[var(--liturgy)] pl-4">
          <RichText
            data={selectedReading.content as any}
            className="prose prose-sm max-w-none font-serif text-[var(--text)]"
          />
        </div>
      )}
    </div>
  )
}
