import { resolveGodchild } from '@/lib/auth'

// Mock Payload client
jest.mock('@/lib/payload', () => ({
  getPayloadClient: jest.fn(),
}))

import { getPayloadClient } from '@/lib/payload'

const mockPayload = {
  find: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(getPayloadClient as jest.Mock).mockResolvedValue(mockPayload)
})

describe('resolveGodchild', () => {
  it('returns godchild when slug and token match', async () => {
    const godchild = { id: 1, name: 'Martin', slug: 'martin', token: 'abc123', active: true }
    mockPayload.find.mockResolvedValue({ docs: [godchild] })

    const result = await resolveGodchild('martin', 'abc123')
    expect(result).toEqual(godchild)
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'godchildren',
      where: { and: [{ slug: { equals: 'martin' } }, { token: { equals: 'abc123' } }, { active: { equals: true } }] },
      limit: 1,
    })
  })

  it('returns null when no match found', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })
    const result = await resolveGodchild('martin', 'wrongtoken')
    expect(result).toBeNull()
  })

  it('returns null when godchild is inactive', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] }) // active: false filtered by query
    const result = await resolveGodchild('martin', 'abc123')
    expect(result).toBeNull()
  })
})
