import { NICHE_OPTIONS } from '@/lib/studio/influencers/options'

export function nicheLabel(id: string): string {
  return NICHE_OPTIONS.find(option => option.id === id)?.label ?? id
}

export function formatInfluencerNiches(nicheIds: string[]): string {
  return nicheIds.map(nicheLabel).filter(Boolean).join(' · ')
}
