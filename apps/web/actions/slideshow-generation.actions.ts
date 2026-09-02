'use server'

import { auth } from '@/auth'
import { getAspectRatioPreset } from '@/lib/carousel/aspect-ratios'
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
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
  SLIDESHOW_PLAN_CREDIT_COST,
  TASK_IDS,
  ModelType,
  type Model,
} from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'

const PICK_POOL_SIZE = 5

export type GenerateSlideshowFromPromptInput = {
  prompt: string
  slideCount?: number
  aspectRatioId?: string
  skillId?: string
  textModel?: string
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

function normalizeSlideCount(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(
    SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
    Math.max(SLIDESHOW_GENERATION_SLIDE_COUNT_MIN, Math.round(value)),
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

function readImageQuery(slide: { imageQuery?: unknown; text?: string }, fallback: string): string {
  const raw = slide.imageQuery
  if (typeof raw === 'string') {
    const cleaned = raw.trim().replace(/^["']+|["']+$/g, '')
    if (cleaned) return cleaned
  }
  const fromText = (slide.text ?? '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 3)
    .join(' ')
  return fromText || simplifyQuery(fallback) || fallback
}

async function searchPhotosForQuery(
  query: string,
  orientation: 'landscape' | 'portrait' | 'squarish',
): Promise<Awaited<ReturnType<typeof searchUnsplashPhotos>>['items']> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const queries = [trimmed]
  const simplified = simplifyQuery(trimmed)
  if (simplified && simplified !== trimmed) queries.push(simplified)

  for (const q of queries) {
    for (const orient of [orientation, undefined] as const) {
      try {
        const result = await searchUnsplashPhotos({
          query: q,
          perPage: 10,
          ...(orient ? { orientation: orient } : {}),
        })
        if (result.items.length > 0) return result.items
      } catch (error) {
        console.error('[searchPhotosForQuery]', q, error)
      }
    }
  }
  return []
}

async function resolveTextModel(
  value?: string,
): Promise<{ ok: true; model?: Model; cost: number } | { ok: false; error: string }> {
  const trimmed = value?.trim()
  if (!trimmed) return { ok: true, cost: 0 }

  const modelsRes = await getModels(
    `limit=1&modelType=${ModelType.TEXT}&value=${encodeURIComponent(trimmed)}`,
  )
  const model = modelsRes.data?.models[0]
  if (!model || model.modelType !== ModelType.TEXT) {
    return { ok: false, error: 'Select a text model to write the slides.' }
  }
  return { ok: true, model, cost: model.cost }
}

export async function generateSlideshowFromPrompt(
  input: GenerateSlideshowFromPromptInput,
): Promise<GenerateSlideshowFromPromptResult> {
  const trimmed = input.prompt.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter a topic or directions first' }
  }

  const slideCount = normalizeSlideCount(input.slideCount)

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
    const textModelRes = await resolveTextModel(input.textModel)
    if (!textModelRes.ok) {
      return { success: false, error: textModelRes.error }
    }

    const billedCost = textModelRes.model ? textModelRes.cost : SLIDESHOW_PLAN_CREDIT_COST
    const balanceRes = await getWorkspaceBalance(workspace.id)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0
    if (credits < billedCost) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const systemOverride = await loadSkillOverride(workspace.id, PROMPT_KEYS.slideshow, input.skillId)
    const plan = await planSlideshow({
      hook: trimmed,
      systemOverride,
      ...(slideCount != null ? { slideCount } : {}),
      ...(textModelRes.model ? { model: textModelRes.model.value } : {}),
    })

    const orientation = unsplashOrientation(preset.dimensions.width, preset.dimensions.height)
    const searchResults = await Promise.all(
      plan.slides.map(slide => searchPhotosForQuery(readImageQuery(slide, trimmed), orientation)),
    )

    const allFound = searchResults.flat()
    const fallbackItems =
      allFound.length > 0
        ? allFound
        : await searchPhotosForQuery(readImageQuery({ text: trimmed }, 'editorial photography'), orientation)

    const usedIds = new Set<string>()
    const imageUrls = searchResults.map(items => {
      const poolSource = items.length > 0 ? items : fallbackItems
      const unused = poolSource.filter(photo => !usedIds.has(photo.id))
      const pool = (unused.length > 0 ? unused : poolSource).slice(0, PICK_POOL_SIZE)
      const photo = pool[Math.floor(Math.random() * pool.length)]
      if (!photo) return undefined
      usedIds.add(photo.id)
      void trackUnsplashDownload(photo.downloadLocation)
      return photo.imageUrl
    })

    if (imageUrls.every(url => !url)) {
      console.error('[generateSlideshowFromPrompt] Unsplash returned no photos', {
        queries: plan.slides.map(slide => readImageQuery(slide, trimmed)),
      })
    }

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

    await deductWorkspaceAiCredits(workspace.id, billedCost)
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

  const slideCount = normalizeSlideCount(input.slideCount)
  const preset = getAspectRatioPreset(input.aspectRatioId ?? 'instagram-portrait')

  try {
    const balanceRes = await getWorkspaceBalance(input.workspaceId)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const modelsRes = await getModels(`limit=100&modelType=image&value=${encodeURIComponent(input.model)}`)
    const model = modelsRes.data?.models[0]
    if (!model) {
      return { success: false, error: 'Model not found.' }
    }

    const textModelRes = await resolveTextModel(input.textModel)
    if (!textModelRes.ok) {
      return { success: false, error: textModelRes.error }
    }

    const imageCountForEstimate = slideCount ?? SLIDESHOW_GENERATION_SLIDE_COUNT_MIN
    const billedCost =
      (textModelRes.model ? textModelRes.cost : SLIDESHOW_PLAN_CREDIT_COST) + model.cost * imageCountForEstimate
    if (credits < billedCost) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const { project } = await getCurrentWorkspaceContext()

    const handle = await tasks.trigger<RealtimeSlideshowGenerationTask>(TASK_IDS.slideshowGeneration, {
      model: input.model,
      workspaceId: input.workspaceId,
      userId: session.user.id,
      prompt: trimmed,
      aspectRatioId: preset.id,
      canvas: preset.dimensions,
      ...(slideCount != null ? { slideCount } : {}),
      ...(project?.id ? { projectId: project.id } : {}),
      ...(input.skillId ? { skillId: input.skillId } : {}),
      ...(textModelRes.model ? { textModel: textModelRes.model.value } : {}),
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
