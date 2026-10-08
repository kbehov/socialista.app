import type { SocialProvider } from '@socialista/types'

/** Per-platform caption norms, injected into the user prompt only for targeted providers. */
export const PLATFORM_COPY_NOTES: Record<SocialProvider, string> = {
  instagram:
    'IG: Hook must land in the first ~125 chars (before fold). Default to tight 1–4 line captions with intentional whitespace; go longer only for a story the brief asks for. Caption complements the visual — never narrates it. For a multi-image carousel, the first frame is the hook and the caption must earn the swipe: one thread across the set, not a slide-by-slide recap. CTA: save, share, or a real comment prompt. 0–2 emojis. Hashtags: 0 default, max 3 if useful.',
  facebook:
    'FB: Conversational and community-first. One easy-to-answer question only if it earns comments. Slightly longer is fine when every line pays rent. Sound like a person in the feed, not an ad. 0–2 hashtags max.',
  twitter:
    'X/Twitter: Hard 280 — every word pays rent. One sharp thought. No setup, no soft landing. Wit and a concrete detail beat polish. 0–1 hashtag. No emoji walls.',
  linkedin:
    'LinkedIn: Human operator voice, not corporate PR or broetry. Strong open before the ~210-char fold. Lead with a real story beat, a sharp opinion, or an insight plus a takeaway. No humble-brag arcs, no "I\'m humbled". 0–1 emoji. No hashtags unless asked.',
  tiktok:
    'TikTok: The caption supports the video — never repeats or explains it. Casual, lowercase-friendly, meme-literate. Keep it short (~150 chars or less). One genuine comment prompt works. 2–4 specific hashtags ok.',
  youtube:
    'YouTube: The first ~100 chars carry search and the fold — front-load the point in human language, never keyword-stuff. A watch or subscribe CTA only if the line earns it.',
  pinterest:
    'Pinterest: Evergreen and benefit-led. Search-friendly without stuffing. The first sentence must stand alone and say what the pin is for. No fake urgency, no clickbait.',
  threads:
    'Threads: Text-first and ultra-casual. A hot take, an observation, or a one-liner. No hashtags. Minimal emojis. Sound like a sharp reply in a group chat.',
}

export function buildPlatformCopyNotes(platforms?: SocialProvider[]): string {
  const selected = (platforms ?? []).filter(provider => provider in PLATFORM_COPY_NOTES)
  if (selected.length === 0) return ''

  if (selected.length === 1) {
    const provider = selected[0]!
    return `Platform — ${provider}:\n${PLATFORM_COPY_NOTES[provider]}`
  }

  return [
    'Writing for multiple platforms at once — one caption must work everywhere below. When norms conflict: shorter wins, fewer emojis/hashtags win, sharper hook wins.',
    ...selected.map(provider => `• ${provider}: ${PLATFORM_COPY_NOTES[provider]}`),
  ].join('\n')
}
