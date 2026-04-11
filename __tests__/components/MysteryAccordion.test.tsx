import { filterReadings } from '@/components/MysteryAccordion'

describe('filterReadings', () => {
  const readings = [
    { source_key: 'st-luc', source_label: 'Saint Luc', content: {} },
    { source_key: 'st-marc', source_label: 'Saint Marc', content: {} },
    { source_key: 'sainte-rita', source_label: 'Sainte Rita', content: {} },
  ]

  it('returns only readings matching allowed_sources', () => {
    const allowed = ['st-luc', 'st-marc']
    const result = filterReadings(readings, allowed)
    expect(result).toHaveLength(2)
    expect(result.map(r => r.source_key)).toEqual(['st-luc', 'st-marc'])
  })

  it('returns empty array when allowed_sources is empty', () => {
    expect(filterReadings(readings, [])).toHaveLength(0)
  })

  it('returns all readings that match', () => {
    const allowed = ['st-luc', 'st-marc', 'sainte-rita']
    expect(filterReadings(readings, allowed)).toHaveLength(3)
  })

  it('returns empty array when no sources match', () => {
    expect(filterReadings(readings, ['st-matthieu'])).toHaveLength(0)
  })
})
