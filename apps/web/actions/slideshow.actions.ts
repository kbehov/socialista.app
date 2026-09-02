'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { loadSkillOverride } from '@/services/skill.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { generateSlideshow } from '@socialista/ai'
import { ModelType, PROMPT_KEYS, SLIDESHOW_GENERATION_SLIDE_COUNT_MAX, SLIDESHOW_GENERATION_SLIDE_COUNT_MIN, SLIDESHOW_PLAN_CREDIT_COST, type Model, type SlideshowContentType } from '@socialista/types'

export type GenerateSlideshowActionResult =
  | { success: true; texts: string[]; contentType: SlideshowContentType }
  | { success: false; error: string }

async function resolveTextModel(
  value?: string,
): Promise<{ ok: true; model?: Model; cost: number } | { ok: false; error: string }> {
  const trimmed = value?.trim()
  if (!trimmed) return { ok: true, cost: SLIDESHOW_PLAN_CREDIT_COST }

  const modelsRes = await getModels(
    `limit=1&modelType=${ModelType.TEXT}&value=${encodeURIComponent(trimmed)}`,
  )
  const model = modelsRes.data?.models[0]
  if (!model || model.modelType !== ModelType.TEXT) {
    return { ok: false, error: 'Select a text model to write the slides.' }
  }
  return { ok: true, model, cost: model.cost }
}

export async function generateSlideshowSlides(
  hook: string,
  slideCount: number | undefined,
  skillId?: string,
  textModel?: string,
): Promise<GenerateSlideshowActionResult> {
  const trimmed = hook.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter a topic or directions first' }
  }

  if (
    slideCount != null &&
    (slideCount < SLIDESHOW_GENERATION_SLIDE_COUNT_MIN || slideCount > SLIDESHOW_GENERATION_SLIDE_COUNT_MAX)
  ) {
    return {
      success: false,
      error: `Slide count must be between ${SLIDESHOW_GENERATION_SLIDE_COUNT_MIN} and ${SLIDESHOW_GENERATION_SLIDE_COUNT_MAX}`,
    }
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to generate slides' }
    }
    const workspaceId = await getCurrentWorkspace()
    if (!workspaceId) {
      return { success: false, error: 'You must be in a workspace to generate slides' }
    }

    const textModelRes = await resolveTextModel(textModel)
    if (!textModelRes.ok) {
      return { success: false, error: textModelRes.error }
    }

    const systemOverride = await loadSkillOverride(workspaceId._id, PROMPT_KEYS.slideshow, skillId)
    const result = await generateSlideshow({
      hook: trimmed,
      systemOverride,
      ...(slideCount != null ? { slideCount } : {}),
      ...(textModelRes.model ? { model: textModelRes.model.value } : {}),
    })
    if (result.texts.length === 0) {
      return { success: false, error: 'No slides were generated' }
    }

    await deductWorkspaceAiCredits(workspaceId._id, textModelRes.cost)
    return { success: true, texts: result.texts, contentType: result.contentType }
  } catch (error) {
    console.error('[generateSlideshowSlides]', error)
    return { success: false, error: 'Failed to generate slides. Please try again.' }
  }
}
