import type { SocialProvider } from '@socialista/types'

/** Per-platform caption norms, injected into the user prompt only for targeted providers. */
export const PLATFORM_COPY_NOTES: Record<SocialProvider, string> = {
  instagram:
    'IG: Hook must land in the first ~125 chars (before fold). Default to tight 1–4 line captions with intentional whitespace; longer only for carousels/story. Caption complements the visual — never narrates it. CTA: save, share, or a real comment prompt. 0–2 emojis. Hashtags: 0 default, max 3 if useful.',
  facebook:
    'FB: Conversational, community-first. Easy-to-answer questions drive comments. Slightly longer is fine if every line earns it. Sound like a person in the feed, not an ad. 0–2 hashtags max.',
  twitter:
    'X/Twitter: Hard 280 — every word pays rent. One sharp thought, no setup, no soft landing. Wit and specificity beat polish. 0–1 hashtag. No emoji walls.',
  linkedin:
    'LinkedIn: Human operator voice, not corporate PR or broetry. Strong open before ~210-char fold. Lead with insight, a real story beat, or a sharp opinion + takeaway. No humble-brag arcs, no "I\'m humbled". 0–1 emoji. No hashtags unless asked.',
  tiktok:
    'TikTok: Caption supports the video — never repeats or explains it. Casual, lowercase-friendly, meme-literate. Keep short (~150 chars or less). A genuine comment-bait question works. 2–4 specific hashtags ok.',
  youtube:
    'YouTube: First ~100 chars carry search + fold — front-load meaning naturally (human, not keyword stuffing). CTA to watch/subscribe only if earned by the line.',
  pinterest:
    'Pinterest: Evergreen, benefit-led, search-friendly without stuffing. Descriptive first sentence. No fake urgency, no clickbait.',
  threads:
    'Threads: Text-first, ultra-casual. Hot take, observation, or one-liner energy. No hashtags. Minimal emojis. Sound like a sharp reply in a group chat.',
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
