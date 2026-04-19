'use client'
import { useState } from 'react'

const REACTIONS = [
  { key: 'pray', emoji: '🙏' },
  { key: 'love', emoji: '❤️' },
  { key: 'cross', emoji: '✝️' },
]

export function ReactionStrip({
  briqueId,
  godchildId,
}: {
  briqueId: string | number
  godchildId: string | number
}) {
  const [selected, setSelected] = useState<string | null>(null)

  async function handleReaction(key: string) {
    if (selected) return
    setSelected(key)
    await fetch('/api/feedback/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briqueId, godchildId, reaction: key }),
    })
  }

  return (
    <div className="flex gap-4 justify-center mt-4">
      {REACTIONS.map(({ key, emoji }) => (
        <button
          key={key}
          onClick={() => handleReaction(key)}
          disabled={!!selected}
          className={`text-3xl transition-transform hover:scale-125 text-[var(--text)] ${
            selected === key ? 'opacity-100 scale-125' : 'opacity-60'
          } disabled:cursor-default`}
          aria-label={key}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
