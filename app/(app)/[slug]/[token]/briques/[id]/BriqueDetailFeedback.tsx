'use client'

import { useState } from 'react'

const EMOJIS = [
  { label: '🙏', value: 'pray' },
  { label: '❤️', value: 'love' },
  { label: '✝️', value: 'cross' },
]

export function BriqueDetailFeedback({
  briqueId,
  godchildId,
}: {
  briqueId: string | number
  godchildId: string | number
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSend() {
    await fetch('/api/feedback/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        briqueId,
        godchildId,
        reaction: selected,
        comment: comment || undefined,
      }),
    })
    setSent(true)
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
      <div className="flex justify-center gap-6 mb-2">
        {EMOJIS.map((e) => (
          <button
            key={e.value}
            onClick={() => setSelected(selected === e.value ? null : e.value)}
            className={`text-3xl transition-transform hover:scale-125 ${
              selected === e.value
                ? 'scale-125 opacity-100'
                : 'opacity-50'
            }`}
            aria-label={e.value}
          >
            {e.label}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Un mot, une pensée…"
        rows={3}
        className="w-full mt-4 p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] text-[var(--text)] resize-none text-sm"
      />

      {sent ? (
        <p className="text-[var(--accent)] text-center mt-3 font-serif">Merci ✝</p>
      ) : (
        <button
          onClick={handleSend}
          disabled={sent}
          className="mt-3 px-6 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium disabled:opacity-40 w-full"
        >
          Envoyer
        </button>
      )}
    </div>
  )
}
