export function buildSlideshowUserPrompt(hook: string, slideCount: number): string {
  const middleCount = Math.max(0, slideCount - 2)

  const densityHint =
    middleCount === 0
      ? 'No middle slides — hook must flow directly into the CTA. Keep both ultra-tight.'
      : middleCount <= 2
        ? `Only ${middleCount} middle slide(s) — prioritize the single most impactful point and one strong swipe trigger. Skip any steps that are not essential.`
        : middleCount <= 5
          ? `${middleCount} middle slides — use the full content-type structure. Each slide gets one focused idea with a swipe trigger.`
          : `${middleCount} middle slides — expand the structure with added depth: extra context, a sub-point, or a bonus tip. Every slide still needs a swipe trigger.`

  return `Hook or topic: "${hook}"
Total slides: ${slideCount}

Breakdown:
- Slide 1: hook — rewrite for maximum scroll-stopping impact, preserve the user's intent
${middleCount > 0 ? `- Slides 2–${slideCount - 1}: ${middleCount} middle slide(s)` : ''}
- Slide ${slideCount}: CTA

Density guidance: ${densityHint}

Generate exactly ${slideCount} slides total.`
}
