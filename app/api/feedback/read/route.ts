import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const { briqueId, godchildId, reaction } = await req.json()
  if (!briqueId || !godchildId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  // Check if feedback already exists
  const existing = await payload.find({
    collection: 'feedback',
    where: {
      and: [
        { brique: { equals: briqueId } },
        { godchild: { equals: godchildId } },
      ],
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    const doc = existing.docs[0]
    if (!doc.reaction && reaction) {
      await payload.update({
        collection: 'feedback',
        id: doc.id,
        data: { reaction },
      })
    }
    return NextResponse.json({ ok: true })
  }

  await payload.create({
    collection: 'feedback',
    data: {
      brique: briqueId,
      godchild: godchildId,
      reaction: reaction ?? null,
      read_at: new Date().toISOString(),
    },
  })

  return NextResponse.json({ ok: true })
}
