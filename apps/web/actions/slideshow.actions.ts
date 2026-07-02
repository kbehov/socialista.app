'use server'

import { generateSlideshow } from '@/agents/slideshow-generator'
import type { SlideshowContentType } from '@/agents/schemas/slideshow-schema'

export type GenerateSlideshowActionResult =
  | { success: true; texts: string[]; contentType: SlideshowContentType }
  | { success: false; error: string }

export async function generateSlideshowSlides(
  hook: string,
  slideCount: number,
): Promise<GenerateSlideshowActionResult> {
  const trimmed = hook.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter a hook or topic first' }
  }

  if (slideCount < 2 || slideCount > 10) {
    return { success: false, error: 'Slide count must be between 2 and 10' }
  }

  try {
    const result = await generateSlideshow({ hook: trimmed, slideCount })
    if (result.texts.length === 0) {
      return { success: false, error: 'No slides were generated' }
    }
    return { success: true, texts: result.texts, contentType: result.contentType }
  } catch (error) {
    console.error('[generateSlideshowSlides]', error)
    return { success: false, error: 'Failed to generate slides. Please try again.' }
  }
}
