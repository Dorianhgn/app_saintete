# Sainteté

A private PWA for spiritual accompaniment between a godfather and his godchildren (*filleuls*). The godfather curates content via a Payload CMS admin panel. Each godchild gets a private URL — no login required.

---

## What it does

- **Dashboard** — latest *brique* (spiritual note) front and centre, with emoji reactions
- **Chapelet** — rosary guide with mystery picker, per-godchild reading filter, progress in localStorage
- **Prières** — prayer library grouped by category
- **Saint patron** — the godchild's patron saint with feast day and prayers
- **Push notifications** — Web Push for new briques (iOS 16.4+)

## Docs sections

| Section | What's covered |
|---|---|
| [Getting started](getting-started.md) | Local dev setup |
| [Architecture](architecture.md) | Stack, auth, URL structure |
| [Data model](data-model.md) | 6 Payload collections |
| [Content management](content-management.md) | Adding content via admin |
| [Deployment](deployment.md) | Vercel + Neon in production |
