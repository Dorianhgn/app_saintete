import { getPayloadClient } from './payload'
import type { Godchild } from '@/payload-types'

export async function resolveGodchild(
  slug: string,
  token: string,
): Promise<Godchild | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'godchildren',
    where: {
      and: [
        { slug: { equals: slug } },
        { token: { equals: token } },
        { active: { equals: true } },
      ],
    },
    limit: 1,
  })
  return (result.docs[0] as Godchild) ?? null
}
