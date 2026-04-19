import Link from 'next/link'

export function NavGrid({
  slug,
  token,
  patronSaintName,
}: {
  slug: string
  token: string
  patronSaintName?: string
}) {
  const base = `/${slug}/${token}`
  const items = [
    { href: `${base}/chapelet`, icon: '📿', label: 'Chapelet' },
    { href: `${base}/prieres`, icon: '🙏', label: 'Prières' },
    { href: `${base}/saint`, icon: '✝️', label: patronSaintName ?? 'Saint Patron' },
  ]
  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      {items.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:bg-[var(--bg-muted)] transition-colors"
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-xs text-[var(--text-muted)]">{label}</span>
        </Link>
      ))}
    </div>
  )
}
