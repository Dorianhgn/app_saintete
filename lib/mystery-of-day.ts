// Day of week: 0 = Sunday, 1 = Monday, …, 6 = Saturday
// Rosary tradition:
const DAY_MAP: Record<number, string> = {
  0: 'glorieux',   // Sunday
  1: 'joyeux',     // Monday
  2: 'douloureux', // Tuesday
  3: 'glorieux',   // Wednesday
  4: 'lumineux',   // Thursday
  5: 'douloureux', // Friday
  6: 'joyeux',     // Saturday
}

export function getMysteryTypeForDay(dayOfWeek: number): string {
  return DAY_MAP[dayOfWeek] ?? 'joyeux'
}

export function getTodaysMysteryType(): string {
  return getMysteryTypeForDay(new Date().getDay())
}
