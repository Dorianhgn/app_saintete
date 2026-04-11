import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const { godchildId, subscription } = await req.json()
  if (!godchildId || !subscription) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'godchildren',
    id: godchildId,
    data: { push_subscription: subscription },
  })

  return NextResponse.json({ ok: true })
}
