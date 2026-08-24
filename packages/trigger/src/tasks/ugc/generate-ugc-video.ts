import { generateUgcVideo as generateUgcVideoClip, planUgcVideoPrompt } from '@socialista/ai'
import {
  connectDb,
  disconnectDb,
  getInfluencerById,
  getUgcProjectById,
  updateUgcClip,
  UgcClipStatus,
  UgcProjectStatus,
  type IUgcClip,
  type IUgcProject,
} from '@socialista/db'
import { TASK_IDS, type UgcClipType, PROMPT_KEYS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateUgcVideoPayloadSchema } from '../../schemas/generate-ugc-video.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { loadSkillOverride } from '../shared/skills.js'
import { assertSufficientCredits, finalizeGeneration, loadModel, loadModelAndWorkspace } from '../shared/workspace.js'

function findClip(project: IUgcProject, clipId: string): IUgcClip | undefined {
  return (project.clips ?? []).find(clip => clip.id === clipId)
}

function resolveInfluencerId(project: IUgcProject, clip: IUgcClip): string | undefined {
  return clip.influencerId?.toString() ?? project.influencerId?.toString()
}

function projectStatusFromClips(clips: IUgcClip[]): UgcProjectStatus {
  if (clips.some(clip => clip.status === UgcClipStatus.GENERATING)) return UgcProjectStatus.GENERATING
  if (clips.some(clip => clip.status === UgcClipStatus.READY)) return UgcProjectStatus.READY
  if (clips.every(clip => clip.status === UgcClipStatus.FAILED) && clips.length > 0) {
    return UgcProjectStatus.FAILED
  }
  return UgcProjectStatus.DRAFT
}

export const generateUgcVideo = schemaTask({
  id: TASK_IDS.generateUgcVideo,
  schema: generateUgcVideoPayloadSchema,
  maxDuration: 900,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    try {
      await connectDb()
      const project = await getUgcProjectById(payload.projectId)
      if (!project) {
        throw new Error('UGC project not found')
      }

      const clip = findClip(project, payload.clipId)
      if (!clip) {
        throw new Error('Clip not found')
      }

      const startFrame = clip.stills[0]?.imageUrl
      if (!startFrame) {
        throw new Error('Generate scenes before video')
      }

      const videoModelValue = clip.models?.video || project.models.video
      const { model, workspace } = await loadModelAndWorkspace(videoModelValue, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost)

      const plannerValue = clip.models?.planner || project.models.planner || clip.models?.script || project.models.script
      const planner = plannerValue ? await loadModel(plannerValue).catch(() => null) : null

      await updateUgcClip(
        payload.projectId,
        clip.id,
        {
          status: UgcClipStatus.GENERATING,
          error: undefined,
          videoRunId: ctx.run.id,
        },
        {
          status: UgcProjectStatus.GENERATING,
          videoRunId: ctx.run.id,
          error: undefined,
        },
      )

      const influencerId = resolveInfluencerId(project, clip)
      const influencer = influencerId ? await getInfluencerById(influencerId) : null

      const stillUrls = clip.stills.flatMap(still => (still.imageUrl ? [still.imageUrl] : []))
      let plannedPrompt = payload.plannedPrompt ?? clip.plannedPrompt
      let negativePrompt = clip.negativePrompt
      const script = clip.script?.text ?? ''
      const directions = clip.directions || clip.scenePrompt
      const clipType = clip.type as UgcClipType

      if (!payload.skipPlanner && !payload.plannedPrompt && planner) {
        setGenerationStatus(20, influencer ? `Planning ${influencer.name}` : 'Planning clip')
        try {
          const systemOverride = await loadSkillOverride({
            skillId: payload.skillId,
            target: PROMPT_KEYS.ugcVideoPlanner,
            workspaceId: payload.workspaceId,
          })
          const planned = await planUgcVideoPrompt({
            stillUrls,
            script,
            directions,
            influencerName: influencer?.name,
            identityFragment: influencer?.identity?.basePromptFragment,
            productName: project.productName,
            aspectRatio: project.aspectRatio,
            sceneCount: stillUrls.length,
            videoModel: model.value,
            clipType,
            durationSec: clip.durationSec,
            systemOverride,
          })
          plannedPrompt = planned.prompt
          negativePrompt = planned.negativePrompt
          await updateUgcClip(payload.projectId, clip.id, {
            plannedPrompt: planned.prompt,
            negativePrompt: planned.negativePrompt,
          })
          await finalizeGeneration(payload.workspaceId, planner)
        } catch (error) {
          logger.error('UGC planner failed, using fallback prompt', { error })
          plannedPrompt =
            plannedPrompt ??
            `Photoreal UGC video, same subject as the start frame. Natural handheld motion. Duration ${clip.durationSec}s. ${script ? `Spoken energy: ${script}.` : ''} ${directions ?? ''} No on-screen text, no watermark.`
        }
      }

      if (!plannedPrompt) {
        plannedPrompt = `Photoreal UGC video starting from this frame. Keep the same person, clothes, room, and product. Natural phone-camera motion for ${clip.durationSec} seconds. ${script ? `Spoken energy: ${script}.` : 'No talking — product or scene motion only.'} ${directions ?? ''} No captions or logos.`
        await updateUgcClip(payload.projectId, clip.id, { plannedPrompt })
      }

      const triggerRunId = `${ctx.run.id}:${clip.id}`
      const started = await startGenerationRecord({
        kind: GenerationKind.VIDEO,
        taskId: TASK_IDS.generateUgcVideo,
        triggerRunId,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        prompt: plannedPrompt,
        model,
        inputs: {
          aspectRatio: project.aspectRatio,
          ugcProjectId: payload.projectId,
          ugcClipId: clip.id,
          referenceImageUrl: startFrame,
          productImageUrl: project.productImageUrls[0],
          durationSec: clip.durationSec,
        },
      })

      setGenerationStatus(55, influencer ? `Rendering ${influencer.name}` : 'Rendering clip')

      try {
        const videoUrl = await generateUgcVideoClip({
          model: model.value,
          provider: model.modelProvider,
          prompt: plannedPrompt,
          imageUrl: startFrame,
          aspectRatio: project.aspectRatio,
          negativePrompt,
          duration: clip.durationSec,
          onProgress: setGenerationStatus,
        })

        await finalizeGeneration(payload.workspaceId, model)
        await completeGenerationRecord({
          triggerRunId,
          result: {
            type: GenerationResultType.VIDEO,
            url: videoUrl,
            thumbnailUrl: startFrame,
            durationSec: clip.durationSec,
          },
          cost: model.cost,
          startedAt: started.startedAt,
          enhancedPrompt: plannedPrompt,
        })

        const latest = await updateUgcClip(payload.projectId, clip.id, {
          videoUrl,
          thumbnailUrl: startFrame,
          generationId: started.generationId,
          plannedPrompt,
          negativePrompt,
          status: UgcClipStatus.READY,
          error: undefined,
        })

        await updateUgcClip(
          payload.projectId,
          clip.id,
          {},
          { status: projectStatusFromClips(latest?.clips ?? []), error: undefined },
        )

        setGenerationStatus(100, 'Video ready')
        return { projectId: payload.projectId, clipId: clip.id }
      } catch (error) {
        await failGenerationRecord({
          triggerRunId,
          error,
          startedAt: started.startedAt,
        })
        const latest = await updateUgcClip(payload.projectId, clip.id, {
          status: UgcClipStatus.FAILED,
          error: error instanceof Error ? error.message : 'Video generation failed',
        })
        await updateUgcClip(
          payload.projectId,
          clip.id,
          {},
          {
            status: projectStatusFromClips(latest?.clips ?? []),
            error: error instanceof Error ? error.message : 'Video generation failed',
          },
        )
        throw error as Error
      }
    } catch (error) {
      setGenerationFailure(error, 'Video generation failed')
      const latest = await updateUgcClip(payload.projectId, payload.clipId, {
        status: UgcClipStatus.FAILED,
        error: error instanceof Error ? error.message : 'Video generation failed',
      }).catch(() => undefined)
      await updateUgcClip(
        payload.projectId,
        payload.clipId,
        {},
        {
          status: projectStatusFromClips(latest?.clips ?? []),
          error: error instanceof Error ? error.message : 'Video generation failed',
        },
      ).catch(() => undefined)
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type GenerateUgcVideoTask = typeof generateUgcVideo
