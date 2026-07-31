export type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night'

export function getGreeting(date = new Date()): { text: string; period: GreetingPeriod } {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', period: 'morning' }
  }

  if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', period: 'afternoon' }
  }

  if (hour >= 17 && hour < 21) {
    return { text: 'Good evening', period: 'evening' }
  }

  return { text: 'Good night', period: 'night' }
}

export function getFirstName(fullName: string | null | undefined): string {
  const trimmed = fullName?.trim()
  if (!trimmed) return 'there'

  return trimmed.split(/\s+/)[0] ?? 'there'
}
