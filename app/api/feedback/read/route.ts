import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const { briqueId, godchildId, reaction, comment } = await req.json()
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
    const updateData: Record<string, unknown> = {}
    if (reaction !== undefined) updateData.reaction = reaction
    if (comment !== undefined) updateData.comment = comment
    if (Object.keys(updateData).length > 0) {
      await payload.update({
        collection: 'feedback',
        id: doc.id,
        data: updateData,
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
      comment: comment ?? null,
      read_at: new Date().toISOString(),
    },
  })

  return NextResponse.json({ ok: true })
}
