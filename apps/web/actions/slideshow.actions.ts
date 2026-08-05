'use server'

import { auth } from '@/auth'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { generateSlideshow } from '@socialista/ai'
import type { SlideshowContentType } from '@socialista/types'
export type GenerateSlideshowActionResult =
  | { success: true; texts: string[]; contentType: SlideshowContentType }
  | { success: false; error: string }

export async function generateSlideshowSlides(
  hook: string,
  slideCount: number,
): Promise<GenerateSlideshowActionResult> {
  const trimmed = hook.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter a topic or directions first' }
  }

  if (slideCount < 2 || slideCount > 10) {
    return { success: false, error: 'Slide count must be between 2 and 10' }
  }

  try {
    const session = await auth()
    // ensure user is signed in
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to generate slides' }
    }
    // ensure user is in a workspace
    const workspaceId = await getCurrentWorkspace()
    if (!workspaceId) {
      return { success: false, error: 'You must be in a workspace to generate slides' }
    }

    const result = await generateSlideshow({ hook: trimmed, slideCount })
    if (result.texts.length === 0) {
      return { success: false, error: 'No slides were generated' }
    }

    await deductWorkspaceAiCredits(workspaceId._id, 0.02)
    return { success: true, texts: result.texts, contentType: result.contentType }
  } catch (error) {
    console.error('[generateSlideshowSlides]', error)
    return { success: false, error: 'Failed to generate slides. Please try again.' }
  }
}
