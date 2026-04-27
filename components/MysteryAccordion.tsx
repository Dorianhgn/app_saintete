'use client'
import { useState } from 'react'
import { ReadingPicker } from './ReadingPicker'

type Reading = {
  source_key: string
  source_label: string
  content: unknown
}

type Mystery = {
  id: string | number
  name: string
  fruit: string
  readings?: Reading[]
  audio_meditation?: unknown
}

export function filterReadings(readings: Reading[], allowedSources: string[]): Reading[] {
  return readings.filter(r => allowedSources.includes(r.source_key))
}

export function MysteryAccordion({
  mystery,
  allowedSources,
  index,
}: {
  mystery: Mystery
  allowedSources: string[]
  index: number
}) {
  const [open, setOpen] = useState(false)
  const visibleReadings = filterReadings(mystery.readings ?? [], allowedSources)

  const audioUrl = mystery.audio_meditation !== null && mystery.audio_meditation !== undefined
    ? (mystery.audio_meditation as { url?: string }).url
    : undefined

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-[var(--bg-muted)] transition-colors"
      >
        <div>
          <div className="font-medium text-[var(--text)]">
            {index}. {mystery.name}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">Fruit du mystère : {mystery.fruit}</div>
        </div>
        <span className="text-[var(--text-muted)] ml-4">{open ? '▼' : '›'}</span>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] p-4">
          <ReadingPicker readings={visibleReadings} />
          {audioUrl && (
            <div className="mt-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">▶ Méditation audio</p>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
