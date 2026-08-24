import type { VideoScriptTone } from '@socialista/types'

const TONE_HINTS: Record<VideoScriptTone, string> = {
  casual: 'Tone: casual — peer-to-peer, conversational, social-native.',
  educational: 'Tone: educational — clear and instructional, still punchy and short.',
  hype: 'Tone: hype — energetic and bold, high urgency, no spam.',
  professional: 'Tone: professional — clean and credible, still short-form (no corporate fluff).',
}

export function buildVideoScriptUserPrompt(
  description: string,
  duration: number,
  tone?: VideoScriptTone,
): string {
  const rounded = Math.round(duration * 10) / 10
  const toneLine = tone ? TONE_HINTS[tone] : 'Tone: casual (default).'
  const segmentHint =
    rounded <= 12
      ? 'Aim for 3–5 segments.'
      : rounded <= 30
        ? 'Aim for 5–10 segments.'
        : rounded <= 60
          ? 'Aim for 8–14 segments.'
          : 'Aim for up to 20 segments — keep each caption focused.'

  return `Video description: "${description}"

Exact video duration: ${rounded} seconds
${toneLine}

Timing requirements:
- First caption (hook) starts near 0s
- Last caption (cta) ends near ${rounded}s
- ${segmentHint}
- Use reading-speed pacing (~2.5 words/sec) for each segment length

Generate a timed on-screen script for this video.`
}
