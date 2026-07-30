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

export const BRIEF_SUGGESTIONS = [
  {
    label: 'Product launch',
    prompt:
      'Launch post for something people have been waiting on — lead with the specific reason to care, not "we launched". Make them want to tap.',
  },
  {
    label: 'Behind the scenes',
    prompt:
      'Behind-the-scenes moment — name the messy real detail most brands hide. Authentic, specific, not polished "BTS" cliché.',
  },
  {
    label: 'Spark comments',
    prompt:
      'Write a caption that makes people leave a real comment — a sharp take or an easy, specific question. No "thoughts?" bait.',
  },
  {
    label: 'Coming soon',
    prompt:
      'Tease something coming — curiosity gap hook, withhold just enough. Specific tension, zero vague "something big is coming".',
  },
] as const

export const COPYWRITER_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.35 }
export const COPYWRITER_FADE_EASE = [0.25, 0.1, 0.25, 1] as const

export const COPYWRITER_GENERATION_PRICE_USD = 0.01
