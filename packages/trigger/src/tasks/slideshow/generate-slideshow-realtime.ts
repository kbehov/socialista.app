import {
  buildSlideImagePrompt,
  buildSlideshowSlides,
  canvasToImageAspectRatio,
  generateImages,
  planSlideshow,
} from '@socialista/ai'
import {
  connectDb,
  createSlideshow,
  disconnectDb,
  SlideshowStatus,
  toObjectId,
} from '@socialista/db'
import type { SlideshowGenerationOutput } from '@socialista/types'
import { PROMPT_KEYS, SLIDESHOW_PLAN_CREDIT_COST, TASK_IDS } from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'

import { slideshowGenerationPayloadSchema } from '../../schemas/slideshow-generation.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  setGenerationEnhancedPrompt,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { notifyGenerationComplete, notifyGenerationFailed } from '../shared/notify.js'
import { loadSkillOverride } from '../shared/skills.js'
import {
  assertSufficientCredits,
  finalizeGeneration,
  loadModelAndWorkspace,
} from '../shared/workspace.js'

export const realtimeSlideshowGeneration = schemaTask({
  id: TASK_IDS.slideshowGeneration,
  schema: slideshowGenerationPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<SlideshowGenerationOutput> => {
    let startedAt: Date | undefined
    let generationId: string | undefined

    try {
      await connectDb()

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      const billedCost = SLIDESHOW_PLAN_CREDIT_COST + model.cost * payload.slideCount
      assertSufficientCredits(workspace, billedCost)

      const started = await startGenerationRecord({
        kind: GenerationKind.SLIDESHOW,
        taskId: TASK_IDS.slideshowGeneration,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        projectId: payload.projectId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: payload.aspectRatioId,
          numImages: payload.slideCount,
          slideCount: payload.slideCount,
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      setGenerationStatus(10, 'Planning your slideshow')

      const systemOverride = await loadSkillOverride({
        skillId: payload.skillId,
        target: PROMPT_KEYS.slideshow,
        workspaceId: payload.workspaceId,
      })
      const plan = await planSlideshow({
        hook: payload.prompt,
        slideCount: payload.slideCount,
        systemOverride,
      })
      await setGenerationEnhancedPrompt(
        ctx.run.id,
        plan.slides.map(slide => slide.text).join('\n\n---\n\n'),
      )

      setGenerationStatus(35, `Generating ${plan.slides.length} slide images`)

      const imageAspectRatio = canvasToImageAspectRatio(payload.canvas)
      const generatedImages = await Promise.all(
        plan.slides.map(async (slide, index) => {
          try {
            const urls = await generateImages({
              model: model.value,
              provider: model.modelProvider,
              prompt: buildSlideImagePrompt(slide.imageQuery),
              aspectRatio: imageAspectRatio,
              workspaceId: payload.workspaceId,
              userId: payload.userId,
              numImages: 1,
            })
            return urls[0]
          } catch {
            setGenerationStatus(
              35 + Math.round((index / plan.slides.length) * 50),
              `Generating slide images (${index + 1}/${plan.slides.length})`,
            )
            return undefined
          }
        }),
      )

      setGenerationStatus(90, 'Assembling slides')

      const slides = buildSlideshowSlides(plan, generatedImages, payload.canvas)
      const previewUrl = generatedImages.find((url): url is string => Boolean(url)) ?? ''

      const slideshow = await createSlideshow({
        name: plan.name,
        status: SlideshowStatus.DRAFT,
        workspace: toObjectId(payload.workspaceId),
        ...(payload.projectId ? { project: toObjectId(payload.projectId) } : {}),
        createdBy: toObjectId(payload.userId),
        canvas: payload.canvas,
        aspectRatioId: payload.aspectRatioId,
        slides,
      })
      const slideshowId = String(slideshow._id)

      await finalizeGeneration(payload.workspaceId, model, billedCost)

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: {
          type: GenerationResultType.IMAGE,
          url: previewUrl || slideshowId,
          slideshowId,
          ...(generatedImages.filter(Boolean).length > 0
            ? { urls: generatedImages.filter((url): url is string => Boolean(url)) }
            : {}),
        },
        cost: billedCost,
        startedAt,
        enhancedPrompt: plan.slides.map(slide => slide.text).join('\n\n---\n\n'),
      })

      setGenerationStatus(100, 'Complete')

      if (!generationId) {
        throw new Error('Missing generationId after successful slideshow generation')
      }

      await notifyGenerationComplete({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        generationId,
        triggerRunId: ctx.run.id,
        kind: 'slideshow',
      })

      return {
        slideshowId,
        imageUrl: previewUrl,
        imageUrls: generatedImages.filter((url): url is string => Boolean(url)),
        cost: billedCost,
        generationId,
      }
    } catch (error) {
      setGenerationFailure(error, 'Slideshow generation failed')
      if (startedAt) {
        await failGenerationRecord({
          triggerRunId: ctx.run.id,
          error,
          startedAt,
        })
      }
      await notifyGenerationFailed({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        generationId,
        triggerRunId: ctx.run.id,
        kind: 'slideshow',
      })
      throw error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeSlideshowGenerationTask = typeof realtimeSlideshowGeneration
