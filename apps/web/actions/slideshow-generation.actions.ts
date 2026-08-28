'use server'

import { auth } from '@/auth'
import { getAspectRatioPreset } from '@/lib/carousel/aspect-ratios'
import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { getModels } from '@/services/models.service'
import { createSlideshow } from '@/services/slideshow.service'
import { searchUnsplashPhotos, trackUnsplashDownload } from '@/services/unsplash.service'
import { deductWorkspaceAiCredits, getWorkspaceBalance } from '@/services/workspace.service'
import { loadSkillOverride } from '@/services/skill.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { createPublicAccessToken } from '@socialista/trigger'
import type { RealtimeSlideshowGenerationTask } from '@socialista/trigger/task-types'
import { buildSlideshowSlides, planSlideshow } from '@socialista/ai'
import {
  PROMPT_KEYS,
  SLIDESHOW_GENERATION_SLIDE_COUNT_DEFAULT,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
  SLIDESHOW_PLAN_CREDIT_COST,
  TASK_IDS,
} from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'

const PICK_POOL_SIZE = 5

export type GenerateSlideshowFromPromptInput = {
  prompt: string
  slideCount?: number
  aspectRatioId?: string
  skillId?: string
}

export type GenerateSlideshowFromPromptResult =
  | { success: true; slideshowId: string }
  | { success: false; error: string }

export type StartSlideshowGenerationInput = GenerateSlideshowFromPromptInput & {
  model: string
  workspaceId: string
}

export type StartSlideshowGenerationResult =
  | { success: true; runId: string; publicAccessToken: string }
  | { success: false; error: string }

function clampSlideCount(value: number | undefined): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : SLIDESHOW_GENERATION_SLIDE_COUNT_DEFAULT
  return Math.min(
    SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
    Math.max(SLIDESHOW_GENERATION_SLIDE_COUNT_MIN, n),
  )
}

function simplifyQuery(query: string): string {
  return query.split(/\s+/).slice(0, 2).join(' ').trim()
}

function unsplashOrientation(width: number, height: number): 'landscape' | 'portrait' | 'squarish' {
  const ratio = width / height
  if (ratio >= 1.15) return 'landscape'
  if (ratio <= 0.9) return 'portrait'
  return 'squarish'
}

export async function generateSlideshowFromPrompt(
  input: GenerateSlideshowFromPromptInput,
): Promise<GenerateSlideshowFromPromptResult> {
  const trimmed = input.prompt.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter a topic or directions first' }
  }

  const slideCount = clampSlideCount(input.slideCount)

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to generate a slideshow' }
    }

    const { workspace, project } = await getCurrentWorkspaceContext()
    if (!workspace) {
      return { success: false, error: 'You must be in a workspace to generate a slideshow' }
    }

    const preset = getAspectRatioPreset(input.aspectRatioId ?? 'instagram-portrait')
    const systemOverride = await loadSkillOverride(workspace.id, PROMPT_KEYS.slideshow, input.skillId)
    const plan = await planSlideshow({
      hook: trimmed,
      slideCount,
      systemOverride,
    })

    const orientation = unsplashOrientation(preset.dimensions.width, preset.dimensions.height)
    const searchResults = await Promise.all(
      plan.slides.map(async slide => {
        try {
          const primary = await searchUnsplashPhotos({
            query: slide.imageQuery,
            perPage: 10,
            orientation,
          })
          if (primary.items.length > 0) return primary.items
          const simplified = simplifyQuery(slide.imageQuery)
          if (!simplified || simplified === slide.imageQuery) return []
          const retry = await searchUnsplashPhotos({ query: simplified, perPage: 10, orientation })
          return retry.items
        } catch {
          return []
        }
      }),
    )

    const usedIds = new Set<string>()
    const imageUrls = searchResults.map(items => {
      const unused = items.filter(photo => !usedIds.has(photo.id))
      const pool = (unused.length > 0 ? unused : items).slice(0, PICK_POOL_SIZE)
      const photo = pool[Math.floor(Math.random() * pool.length)]
      if (!photo) return undefined
      usedIds.add(photo.id)
      void trackUnsplashDownload(photo.downloadLocation)
      return proxiedImageUrl(photo.imageUrl)
    })

    const slides = buildSlideshowSlides(plan, imageUrls, preset.dimensions)
    const created = await createSlideshow({
      workspaceId: workspace.id,
      ...(project?.id ? { projectId: project.id } : {}),
      name: plan.name,
      canvas: preset.dimensions,
      aspectRatioId: preset.id,
      slides,
    })

    if (!created.success || !created.data?.slideshow.id) {
      return { success: false, error: created.message ?? 'Failed to save the slideshow' }
    }

    await deductWorkspaceAiCredits(workspace.id, SLIDESHOW_PLAN_CREDIT_COST)
    return { success: true, slideshowId: created.data.slideshow.id }
  } catch (error) {
    console.error('[generateSlideshowFromPrompt]', error)
    return { success: false, error: 'Failed to generate slideshow. Please try again.' }
  }
}

export async function startSlideshowGeneration(
  input: StartSlideshowGenerationInput,
): Promise<StartSlideshowGenerationResult> {
  const trimmed = input.prompt.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter a topic or directions first' }
  }

  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'You must be signed in to generate a slideshow.' }
  }

  const slideCount = clampSlideCount(input.slideCount)
  const preset = getAspectRatioPreset(input.aspectRatioId ?? 'instagram-portrait')

  try {
    const balanceRes = await getWorkspaceBalance(input.workspaceId)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const modelsRes = await getModels(`limit=100&modelType=image&value=${encodeURIComponent(input.model)}`)
    const model = modelsRes.data?.models[0]
    if (!model) {
      return { success: false, error: 'Model not found.' }
    }

    const billedCost = SLIDESHOW_PLAN_CREDIT_COST + model.cost * slideCount
    if (credits < billedCost) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const { project } = await getCurrentWorkspaceContext()

    const handle = await tasks.trigger<RealtimeSlideshowGenerationTask>(TASK_IDS.slideshowGeneration, {
      model: input.model,
      workspaceId: input.workspaceId,
      userId: session.user.id,
      prompt: trimmed,
      slideCount,
      aspectRatioId: preset.id,
      canvas: preset.dimensions,
      ...(project?.id ? { projectId: project.id } : {}),
      ...(input.skillId ? { skillId: input.skillId } : {}),
    })

    const publicAccessToken = await createPublicAccessToken(handle.id)

    return {
      success: true,
      runId: handle.id,
      publicAccessToken,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start slideshow generation',
    }
  }
}
