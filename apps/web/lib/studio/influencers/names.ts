import type { InfluencerGender } from '@socialista/types'

const WOMEN_FIRST_NAMES = [
  'Ava',
  'Maya',
  'Sofia',
  'Elena',
  'Chloe',
  'Priya',
  'Nina',
  'Samira',
  'Iris',
  'Amara',
  'Lina',
  'Nora',
  'Zoe',
  'Hana',
  'Camila',
  'Aisha',
  'Mei',
  'Leila',
  'Freya',
  'Anya',
] as const

const MEN_FIRST_NAMES = [
  'Noah',
  'Leo',
  'Kai',
  'Omar',
  'Marcus',
  'Dev',
  'Elias',
  'Mateo',
  'Adrian',
  'Malik',
  'Ren',
  'Soren',
  'Andre',
  'Theo',
  'Julian',
  'Hassan',
  'Kenji',
  'Luca',
  'Owen',
  'Jordan',
] as const

const LAST_NAMES = [
  'Brooks',
  'Nguyen',
  'Patel',
  'Kim',
  'Garcia',
  'Walsh',
  'Singh',
  'Adeyemi',
  'Costa',
  'Laurent',
  'Rivera',
  'Chen',
  'Rossi',
  'Park',
  'Hale',
  'Webb',
  'Sharma',
  'Okonkwo',
  'Haddad',
  'Alvarez',
] as const

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function firstNamesForGender(gender?: InfluencerGender): readonly string[] {
  if (gender === 'male') return MEN_FIRST_NAMES
  if (gender === 'female') return WOMEN_FIRST_NAMES
  return Math.random() < 0.5 ? WOMEN_FIRST_NAMES : MEN_FIRST_NAMES
}

/** Realistic first + last name when the user leaves the influencer untitled. */
export function randomInfluencerName(gender?: InfluencerGender): string {
  return `${pickRandom(firstNamesForGender(gender))} ${pickRandom(LAST_NAMES)}`
}
