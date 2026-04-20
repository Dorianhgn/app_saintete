'use client'
import { useState, useEffect } from 'react'
import type { Prayer } from '@/payload-types'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { appConverters } from '@/lib/richTextConverters'

const PINNED_KEY = 'saintete-pinned'
const MAX_PINS = 2

function getPinned(slug: string): string[] {
  try {
    const raw = localStorage.getItem(`${PINNED_KEY}-${slug}`)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function setPinned(slug: string, ids: string[]) {
  try {
    localStorage.setItem(`${PINNED_KEY}-${slug}`, JSON.stringify(ids))
  } catch {
  }
}

export function PrayerItem({ prayer, slug }: { prayer: Prayer; slug?: string }) {
  const [open, setOpen] = useState(false)
  const [pinned, setPinnedState] = useState(false)

  useEffect(() => {
    if (!slug) return
    const ids = getPinned(slug)
    setPinnedState(ids.includes(String(prayer.id)))
  }, [slug, prayer.id])

  function togglePin(e: React.MouseEvent) {
    e.stopPropagation()
    if (!slug) return
    const ids = getPinned(slug)
    const id = String(prayer.id)
    if (ids.includes(id)) {
      const next = ids.filter((x) => x !== id)
      setPinned(slug, next)
      setPinnedState(false)
    } else {
      const next = ids.length >= MAX_PINS ? [...ids.slice(1), id] : [...ids, id]
      setPinned(slug, next)
      setPinnedState(true)
    }
  }

  const audioUrl = prayer.audio !== null && prayer.audio !== undefined && typeof prayer.audio === 'object'
    ? (prayer.audio as { url?: string }).url
    : undefined

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-[var(--bg-muted)] transition-colors"
      >
        <span className="font-medium text-[var(--text)]">{prayer.title}</span>
        <span className="flex items-center gap-2">
          {slug && (
            <span
              role="button"
              onClick={togglePin}
              className={pinned ? 'text-base' : 'text-base opacity-40'}
              aria-label={pinned ? 'Désépingler' : 'Épingler'}
            >
              📌
            </span>
          )}
          <span className="text-[var(--text-muted)]">{open ? '▼' : '›'}</span>
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--border)] p-4">
          <RichText
            data={prayer.content as any}
            className="prose prose-sm max-w-none font-serif text-[var(--text)]"
            converters={appConverters}
          />
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full mt-4" />
          )}
        </div>
      )}
    </div>
  )
}
