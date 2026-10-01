export const TONE_OPTIONS = [
  { value: '', label: 'Auto' },
  { value: 'bold, opinionated, scroll-stopping — sharp claims, zero soft hedging', label: 'Bold' },
  { value: 'playful and witty — dry humor, clever specifics, light punchlines', label: 'Playful' },
  {
    value: 'credible and human — operator voice, insight-led, never corporate or stiff',
    label: 'Professional',
  },
  { value: 'casual and conversational — like texting a smart friend, lowercase energy ok', label: 'Casual' },
] as const

export const COPYWRITER_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.35 }
export const COPYWRITER_FADE_EASE = [0.25, 0.1, 0.25, 1] as const

export const COPYWRITER_GENERATION_CREDITS = 1
