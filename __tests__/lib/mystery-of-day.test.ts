import { getMysteryTypeForDay } from '@/lib/mystery-of-day'

describe('getMysteryTypeForDay', () => {
  // Traditional rosary day assignments:
  // Joyeux: lundi, samedi
  // Douloureux: mardi, vendredi
  // Glorieux: mercredi, dimanche
  // Lumineux: jeudi

  it('returns joyeux for Monday (day 1)', () => {
    expect(getMysteryTypeForDay(1)).toBe('joyeux')
  })

  it('returns douloureux for Tuesday (day 2)', () => {
    expect(getMysteryTypeForDay(2)).toBe('douloureux')
  })

  it('returns glorieux for Wednesday (day 3)', () => {
    expect(getMysteryTypeForDay(3)).toBe('glorieux')
  })

  it('returns lumineux for Thursday (day 4)', () => {
    expect(getMysteryTypeForDay(4)).toBe('lumineux')
  })

  it('returns douloureux for Friday (day 5)', () => {
    expect(getMysteryTypeForDay(5)).toBe('douloureux')
  })

  it('returns joyeux for Saturday (day 6)', () => {
    expect(getMysteryTypeForDay(6)).toBe('joyeux')
  })

  it('returns glorieux for Sunday (day 0)', () => {
    expect(getMysteryTypeForDay(0)).toBe('glorieux')
  })
})
