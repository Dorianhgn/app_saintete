import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = await getPayloadClient()

  try {
    const prayer = await payload.findByID({
      collection: 'prayers',
      id,
      depth: 1,
    })
    return NextResponse.json(prayer)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
