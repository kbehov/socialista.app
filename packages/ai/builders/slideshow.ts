import {
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
} from '@socialista/types'

function packingInstructions(slideCount?: number): string {
  const budget =
    slideCount == null
      ? `You choose the slide count (${SLIDESHOW_GENERATION_SLIDE_COUNT_MIN}–${SLIDESHOW_GENERATION_SLIDE_COUNT_MAX}). Slide 1 is the hook. Remaining slides are content. Do not reserve the last slide for a CTA.`
      : `Exact slide count is ${slideCount}. Slide 1 is the hook. Slides 2–${slideCount} are content unless a CTA truly belongs — then at most one last slide.`

  return `Deliverable vs slide budget:
${budget}
- If the user asked for N items (affirmations, tips, reasons, mistakes, quotes, habits, etc.), every one of those N items must appear in the deck. Never drop items to fit a template or to make room for a CTA.
- If N items fit one-per-slide after the hook, do that.
- If N is larger than the remaining slides, pack 2–4 items onto a content slide as a tight numbered list — one short item per line. Example: "10 affirmations" with 5 slides → hook, then 3 / 3 / 2 / 2 items. Not hook + 3 items + CTA.
- Skip "notice the theme / pattern" slides when they would force dropping items.
- Packed slides are the exception to one-idea-per-slide. Keep each line very short (about 4–8 words).
- CTA is optional. Skip it for lists, quotes, breakdowns, and "no CTA." If you include one, prefer a line on the last value slide over a dedicated page.`
}

export function buildSlideshowUserPrompt(hook: string, slideCount?: number): string {
  const auto = slideCount == null
  const contentCount = auto ? undefined : Math.max(0, slideCount - 1)

  const countBlock = auto
    ? `Slide count: auto.
Pick between ${SLIDESHOW_GENERATION_SLIDE_COUNT_MIN} and ${SLIDESHOW_GENERATION_SLIDE_COUNT_MAX} slides.
Prefer the shortest deck that still delivers everything the user asked for. A 10-item list should not collapse into a 5-slide story that only names 3 items, and should not spend a page on a CTA.`
    : `Total slides: ${slideCount} — exact. Do not add or omit slides.

Breakdown:
- Slide 1: hook — rewrite for maximum scroll-stopping impact, preserve the user's intent
${contentCount ? `- Slides 2–${slideCount}: ${contentCount} content slide(s). Do not force the last one to be a CTA.` : ''}`

  let densityHint: string
  if (auto) {
    densityHint =
      'Match density to the request: one idea per slide when it fits; pack items when the list is longer than the deck. Do not pad with a CTA.'
  } else if (!contentCount) {
    densityHint = 'Hook only — keep it ultra-tight.'
  } else if (contentCount <= 2) {
    densityHint = `Only ${contentCount} content slide(s). If the user asked for more items than that, pack multiple items per slide. Do not spend one of them on a CTA unless they asked for it.`
  } else if (contentCount <= 5) {
    densityHint = `${contentCount} content slides — one idea per slide unless the user asked for more items than this, in which case pack. CTA only if it belongs.`
  } else {
    densityHint = `${contentCount} content slides — expand with depth when the request is a story or guide. If it is a long list, pack items rather than padding with commentary or a CTA.`
  }

  return `Hook or topic: "${hook}"

${countBlock}

${packingInstructions(slideCount)}

Density guidance: ${densityHint}

${auto ? `Return ${SLIDESHOW_GENERATION_SLIDE_COUNT_MIN}–${SLIDESHOW_GENERATION_SLIDE_COUNT_MAX} slides.` : `Generate exactly ${slideCount} slides total.`}`
}

export function buildSlideshowPlanUserPrompt(hook: string, slideCount?: number): string {
  const countNote =
    slideCount == null
      ? `Put every slide in the \`slides\` array — first item is the hook. Choose a length between ${SLIDESHOW_GENERATION_SLIDE_COUNT_MIN} and ${SLIDESHOW_GENERATION_SLIDE_COUNT_MAX}. Do not add a CTA slide unless it belongs.`
      : `Put every slide in the \`slides\` array — first item is the hook. Exactly ${slideCount} items in that array. Do not add a CTA slide unless it belongs.`

  return `${buildSlideshowUserPrompt(hook, slideCount)}

${countNote}

Also plan a production-ready visual system for this deck:
- Pick one coherent theme (background, text, accent, typeface) that reads well on mobile.
- Prefer dark backgrounds with light text, or a high-contrast editorial palette.
- Every slide is full-bleed: the photo is the full canvas background, with overlay + white text on top. Never split (image panel) or minimal (solid color only).
- For each slide, write a 2–4 word Unsplash-style image query: concrete nouns, real-world scenes, no abstract concepts, no people looking at cameras unless the topic requires it.
- Do not put the same imageQuery on two slides.
- Image queries must stay visual (what the camera sees), not the slide copy restated.`
}
