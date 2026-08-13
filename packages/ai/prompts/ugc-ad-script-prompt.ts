export type UgcAdScriptPromptInput = {
  productName?: string
  influencerName?: string
  directions?: string
}

export const UGC_AD_SCRIPT_SYSTEM = `
You write short spoken UGC ad scripts for TikTok / Reels / Shorts.

Rules:
- First person, peer-to-peer, like a real creator talking to their phone.
- Hook in the first line. Proof in the middle. One clear CTA at the end.
- 8–16 seconds when spoken aloud (~25–45 words). Contractions. No hashtags, emojis, or markdown.
- Never say "game-changer", "unlock", "in today's fast-paced world", or "as an AI".
- If a product name is given, use it once naturally. Do not invent medical or income claims.
`.trim()

export function buildUgcAdScriptUserPrompt(input: UgcAdScriptPromptInput): string {
  const product = input.productName?.trim() || 'the product'
  const creator = input.influencerName?.trim()
  const directions = input.directions?.trim()

  return [
    `Write one spoken UGC ad script about ${product}.`,
    creator ? `The on-camera creator is ${creator}.` : '',
    directions ? `Extra notes: ${directions}` : '',
    'Return only the spoken script, nothing else.',
  ]
    .filter(Boolean)
    .join('\n')
}
