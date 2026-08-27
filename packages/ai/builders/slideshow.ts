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

export function buildSlideshowPlanUserPrompt(hook: string, slideCount: number): string {
  return `${buildSlideshowUserPrompt(hook, slideCount)}

Put every slide in the \`slides\` array — first item is the hook, last item is the CTA. Target ${slideCount} items in that array (not ${slideCount} plus a separate hook/CTA).

Also plan a production-ready visual system for this deck:
- Pick one coherent theme (background, text, accent, typeface) that reads well on mobile.
- Prefer dark backgrounds with light text, or a high-contrast editorial palette.
- For each slide, write a 2–4 word Unsplash-style image query: concrete nouns, real-world scenes, no abstract concepts, no people looking at cameras unless the topic requires it.
- Vary layouts. Typical mix: hook = full-bleed, middle slides mix split + full-bleed, CTA = minimal.
- Do not put the same imageQuery on two slides.
- Image queries must stay visual (what the camera sees), not the slide copy restated.`
}
