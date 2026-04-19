'use client'
import { useEffect, useState } from 'react'
import { PrayerItem } from '@/components/PrayerItem'

type Prayer = {
  id: string | number
  title: string
  content: unknown
  audio?: unknown
}

export function PinnedPrayers({ slug, token }: { slug: string; token: string }) {
  const [prayers, setPrayers] = useState<Prayer[]>([])

  useEffect(() => {
    const key = `saintete-pinned-${slug}`
    const stored = localStorage.getItem(key)
    if (!stored) return

    let ids: (string | number)[]
    try {
      ids = JSON.parse(stored)
    } catch {
      return
    }

    if (!Array.isArray(ids) || ids.length === 0) return

    Promise.all(
      ids.map(id =>
        fetch(`/api/prayers/${id}`).then(r => r.ok ? r.json() : null)
      )
    ).then(results => {
      setPrayers(results.filter(Boolean))
    })
  }, [slug])

  if (prayers.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">Prières épinglées</h2>
      <div className="flex flex-col gap-2">
        {prayers.map(p => (
          <PrayerItem key={p.id} prayer={p as any} slug={slug} />
        ))}
      </div>
    </div>
  )
}
