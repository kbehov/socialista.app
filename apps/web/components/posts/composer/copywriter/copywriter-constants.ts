export const TONE_OPTIONS = [
  { value: '', label: 'Auto' },
  { value: 'bold and scroll-stopping', label: 'Bold' },
  { value: 'playful and witty', label: 'Playful' },
  { value: 'professional and polished', label: 'Professional' },
  { value: 'casual and conversational', label: 'Casual' },
] as const

export const BRIEF_SUGGESTIONS = [
  {
    label: 'Product launch',
    prompt: 'Product launch — energetic, make people want to tap',
  },
  {
    label: 'Behind the scenes',
    prompt: 'Behind-the-scenes moment, authentic and relatable',
  },
  {
    label: 'Spark comments',
    prompt: 'Ask a question to spark comments',
  },
  {
    label: 'Coming soon',
    prompt: 'Tease something coming soon — curiosity hook',
  },
] as const

export const COPYWRITER_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.35 }
export const COPYWRITER_FADE_EASE = [0.25, 0.1, 0.25, 1] as const

export const COPYWRITER_GENERATION_PRICE_USD = 0.01
