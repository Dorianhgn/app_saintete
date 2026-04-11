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
      <p className="text-sm text-white/50 mb-2">Quelle famille de mystères voulez-vous prier ?</p>
      {MYSTERY_TYPES.map(({ key, label, subtitle, days, icon }) => {
        const isToday = key === todayType
        return (
          <Link
            key={key}
            href={`${base}/${key}`}
            className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
              isToday
                ? 'border-violet-500 bg-violet-950/30 text-violet-200'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className={`font-medium ${isToday ? 'text-violet-300' : ''}`}>{label}</div>
                <div className="text-xs text-white/40">{subtitle} — {days}</div>
                {isToday && (
                  <div className="text-xs text-violet-400 mt-0.5">✦ Aujourd&apos;hui</div>
                )}
              </div>
            </div>
            <span className="text-white/30">›</span>
          </Link>
        )
      })}
    </div>
  )
}
