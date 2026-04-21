import Link from 'next/link'

const MYSTERY_TYPES = [
  { key: 'joyeux',     label: 'Mystères Joyeux',     subtitle: 'Enfance du Christ',             days: 'Lundi, Samedi',      icon: '🌸' },
  { key: 'lumineux',   label: 'Mystères Lumineux',   subtitle: 'Vie publique de Jésus',         days: 'Jeudi',              icon: '☀️' },
  { key: 'douloureux', label: 'Mystères Douloureux', subtitle: 'Passion et mort sur la croix',  days: 'Mardi, Vendredi',    icon: '✝️' },
  { key: 'glorieux',   label: 'Mystères Glorieux',   subtitle: 'Résurrection et suites',        days: 'Mercredi, Dimanche', icon: '👑' },
]

export function MysteryPicker({
  slug,
  token,
  todayType,
}: {
  slug: string
  token: string
  todayType: string
}) {
  const base = `/${slug}/${token}/chapelet`
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Choisir les mystères</p>
      {MYSTERY_TYPES.map(({ key, label, subtitle, days, icon }) => {
        const isToday = key === todayType
        return (
          <Link
            key={key}
            href={`${base}/${key}`}
            className={`flex items-center justify-between p-4 border border-l-[3px] rounded-[0_10px_10px_0] transition-colors ${
              isToday
                ? 'bg-[var(--bg-muted)] border-[var(--accent)] border-l-[var(--accent)]'
                : 'bg-[var(--bg-card)] border-[var(--border)] border-l-[var(--liturgy)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="font-serif font-medium text-[var(--text)]">{label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle} — {days}</div>
                {isToday && (
                  <div className="text-xs text-[var(--accent)] mt-0.5">Aujourd&apos;hui</div>
                )}
              </div>
            </div>
            <span className="text-[var(--text-muted)]">›</span>
          </Link>
        )
      })}
    </div>
  )
}
