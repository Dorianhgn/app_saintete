'use client'
import { useState } from 'react'
import type { Prayer } from '@/payload-types'

function RichText({ content }: { content: unknown }) {
  const c = content as { root?: { children?: Array<{ type: string; children?: Array<{ text: string }> }> } }
  if (!c?.root?.children) return null
  return (
    <div className="prose prose-invert prose-sm max-w-none font-serif">
      {c.root.children.map((node, i) => (
        node.type === 'paragraph'
          ? <p key={i}>{node.children?.map((child) => child.text).join('')}</p>
          : null
      ))}
    </div>
  )
}

export function PrayerItem({ prayer }: { prayer: Prayer }) {
  const [open, setOpen] = useState(false)

  const audioUrl = prayer.audio !== null && prayer.audio !== undefined && typeof prayer.audio === 'object'
    ? (prayer.audio as { url?: string }).url
    : undefined

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium">{prayer.title}</span>
        <span className="text-white/30">{open ? '▼' : '›'}</span>
      </button>
      {open && (
        <div className="border-t border-white/10 p-4">
          <RichText content={prayer.content} />
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full mt-4" />
          )}
        </div>
      )}
    </div>
  )
}
