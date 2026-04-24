import webpush from 'web-push'
import type { Where } from 'payload'
import type { Godchild } from '@/payload-types'
import { getPayloadClient } from './payload'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function sendPushToBrique(briqueId: string | number) {
  const payload = await getPayloadClient()

  const brique = await payload.findByID({ collection: 'briques', id: briqueId })

  const targetId = brique.target
    ? (typeof brique.target === 'object' ? (brique.target as Godchild).id : brique.target)
    : null
  const where: Where = targetId != null
    ? { id: { equals: targetId } }
    : { active: { equals: true } }

  const godchildren = await payload.find({
    collection: 'godchildren',
    where,
    limit: 100,
  })

  for (const godchild of godchildren.docs) {
    if (!godchild.push_subscription) continue
    try {
      await webpush.sendNotification(
        // On passe par 'unknown' avant de caster vers le type attendu
        (godchild.push_subscription as unknown) as Parameters<typeof webpush.sendNotification>[0],
        JSON.stringify({
          title: 'Sainteté',
          body: brique.title,
          icon: '/icons/icon-192.png',
        }),
      )
    } catch (err) {
      console.error(`Push failed for ${godchild.name}:`, err)
    }
  }
}
