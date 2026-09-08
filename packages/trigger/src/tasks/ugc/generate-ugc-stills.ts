import {
  buildImagePrompt,
  buildUgcSceneStillPrompt,
  buildUgcStillRefUrls,
  generateImage,
  UGC_STILL_LOCK_FOOTER,
} from '@socialista/ai'
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
import {
  appendUgcStills,
  TASK_IDS,
  type AspectRatio,
  type UgcClipType,
  PROMPT_KEYS,
} from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateUgcStillsPayloadSchema } from '../../schemas/generate-ugc-stills.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  setGenerationEnhancedPrompt,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { loadSkillOverride } from '../shared/skills.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

function influencerRefs(influencer: {
  coverImageUrl?: string
  galleryImageUrls?: string[]
  identity?: { referenceImageUrls?: string[] }
}): string[] {
  const urls = [
    ...(influencer.identity?.referenceImageUrls ?? []),
    ...(influencer.galleryImageUrls ?? []),
    influencer.coverImageUrl,
  ].filter((url): url is string => Boolean(url))
  return [...new Set(urls)]
}

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

function previousSceneStillUrl(clips: IUgcClip[], clipId: string): string | undefined {
  const index = clips.findIndex(clip => clip.id === clipId)
  if (index <= 0) return undefined
  for (let i = index - 1; i >= 0; i--) {
    const url = clips[i]?.stills.find(still => still.imageUrl)?.imageUrl
    if (url) return url
  }
  return undefined
}

function resolveAspectRatio(value?: string): AspectRatio {
  return (value === '1:1' || value === '16:9' || value === '4:3' || value === '9:16'
    ? value
    : '9:16') satisfies AspectRatio
}

export const generateUgcStills = schemaTask({
  id: TASK_IDS.generateUgcStills,
  schema: generateUgcStillsPayloadSchema,
  maxDuration: 900,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    try {
      await connectDb()
      const project = await getUgcProjectById(payload.projectId)
      if (!project) {
        throw new Error('UGC project not found')
      }

      const clips = project.clips ?? []
      const targets = payload.clipId
        ? clips.filter(clip => clip.id === payload.clipId)
        : clips
      if (targets.length === 0) {
        throw new Error(payload.clipId ? 'Clip not found' : 'Add a scene first')
      }

      const firstClip = targets[0]!
      const imageModelValue = payload.model || firstClip.models?.image || project.models.image
      const { model, workspace } = await loadModelAndWorkspace(imageModelValue, payload.workspaceId)
      const shotCount = payload.count && payload.count > 0 ? payload.count : 1
      assertSufficientCredits(workspace, model.cost * targets.length * shotCount)

      const aspectRatio = resolveAspectRatio(project.aspectRatio)
      const systemOverride = await loadSkillOverride({
        skillId: payload.skillId,
        target: PROMPT_KEYS.imagePrompt,
        workspaceId: payload.workspaceId,
      })

      let liveClips = clips
      let failed = false
      let completed = 0
      const totalShots = Math.max(targets.length * shotCount, 1)

      for (const target of targets) {
        const clip = findClip({ ...project, clips: liveClips }, target.id) ?? target
        const clipType = clip.type as UgcClipType
        const existingStills = (clip.stills ?? []).filter(still => still.imageUrl)

        await updateUgcClip(
          payload.projectId,
          clip.id,
          {
            status: UgcClipStatus.GENERATING,
            error: undefined,
            stillsRunId: ctx.run.id,
            videoUrl: undefined,
            thumbnailUrl: undefined,
            approved: false,
            sceneCount: 1,
            ...(payload.prompt?.trim() ? { scenePrompt: payload.prompt.trim() } : {}),
            ...(payload.model ? { models: { ...clip.models, image: payload.model } } : {}),
          },
          {
            status: UgcProjectStatus.GENERATING,
            stillsRunId: ctx.run.id,
            assembledVideoUrl: undefined,
            assembledRunId: undefined,
            error: undefined,
            ...(payload.model ? { models: { ...project.models, image: payload.model } } : {}),
          },
        )

        const influencerId = resolveInfluencerId(project, clip)
        const influencer = influencerId ? await getInfluencerById(influencerId) : null
        if (influencerId && !influencer) {
          await updateUgcClip(
            payload.projectId,
            clip.id,
            { status: UgcClipStatus.FAILED, error: 'Influencer not found' },
            { status: UgcProjectStatus.FAILED, error: 'Influencer not found' },
          )
          throw new Error('Influencer not found')
        }

        const previousStillUrl = previousSceneStillUrl(liveClips, clip.id)
        const hasSceneProduct = clipType !== 'app-showcase' && (clip.referenceImageUrls?.length ?? 0) > 0
        const autoRefs = buildUgcStillRefUrls({
          influencerReferenceUrls: influencer ? influencerRefs(influencer) : [],
          productImageUrls: hasSceneProduct ? clip.referenceImageUrls : project.productImageUrls,
          extraReferenceUrls: clipType === 'app-showcase' ? clip.referenceImageUrls : undefined,
          previousStillUrl,
          sceneIndex: 0,
        })
        const imageUrls =
          payload.referenceImageUrls && payload.referenceImageUrls.length > 0
            ? [...new Set(payload.referenceImageUrls)]
            : autoRefs

        const seed = payload.prompt?.trim()
          ? payload.prompt.trim()
          : buildUgcSceneStillPrompt({
              clipType,
              sceneIndex: 0,
              sceneCount: 1,
              influencerName: influencer?.name,
              identityFragment: influencer?.identity?.basePromptFragment,
              productName: project.productName,
              scenePrompt: clip.scenePrompt,
            })

        let nextStills = [...existingStills]
        try {
          for (let shotIndex = 0; shotIndex < shotCount; shotIndex++) {
            const triggerRunId = `${ctx.run.id}:${clip.id}:${shotIndex}`
            const started = await startGenerationRecord({
              kind: GenerationKind.IMAGE,
              taskId: TASK_IDS.generateUgcStills,
              triggerRunId,
              workspaceId: payload.workspaceId,
              userId: payload.userId,
              projectId: project.project?.toString(),
              prompt: seed,
              model,
              inputs: {
                aspectRatio,
                ugcProjectId: payload.projectId,
                ugcClipId: clip.id,
                ugcShotId: String(shotIndex),
                productImageUrl: project.productImageUrls[0],
                referenceImageUrl: imageUrls[0],
              },
            })

            const existingPrompt = nextStills[0]?.enhancedPrompt
            let enhanced = existingPrompt && payload.skipEnhance ? existingPrompt : seed

            try {
              if (!payload.skipEnhance) {
                setGenerationStatus(
                  Math.round((completed / totalShots) * 40),
                  'Preparing your prompt',
                )
                const media = imageUrls.slice(0, 4).map(imageUrl => ({ imageUrl }))
                enhanced = await buildImagePrompt({
                  prompt: seed,
                  media: media.length > 0 ? media : undefined,
                  aspectRatio,
                  systemOverride,
                  targetModel: model.value,
                })
                await setGenerationEnhancedPrompt(triggerRunId, enhanced)
              }

              const finalPrompt = `${enhanced}\n\n${UGC_STILL_LOCK_FOOTER}`
              setGenerationStatus(
                40 + Math.round((completed / totalShots) * 50),
                `Generating photo ${completed + 1} of ${totalShots}`,
              )

              const imageUrl = await generateImage(
                {
                  model: model.value,
                  provider: model.modelProvider,
                  prompt: finalPrompt,
                  aspectRatio,
                  workspaceId: payload.workspaceId,
                  userId: payload.userId,
                  imageUrl: imageUrls[0],
                  imageUrls,
                },
                setGenerationStatus,
              )

              await finalizeGeneration(payload.workspaceId, model)
              await completeGenerationRecord({
                triggerRunId,
                result: { type: GenerationResultType.IMAGE, url: imageUrl },
                cost: model.cost,
                startedAt: started.startedAt,
                enhancedPrompt: enhanced,
              })

              nextStills = appendUgcStills(nextStills, [
                {
                  index: 0,
                  imageUrl,
                  generationId: started.generationId,
                  enhancedPrompt: enhanced,
                },
              ])
              const latest = await updateUgcClip(payload.projectId, clip.id, {
                stills: nextStills,
                error: undefined,
              })
              liveClips = latest?.clips ?? liveClips.map(item =>
                item.id === clip.id ? { ...item, stills: nextStills } : item,
              )
              completed += 1
            } catch (error) {
              await failGenerationRecord({
                triggerRunId,
                error,
                startedAt: started.startedAt,
              })
              throw error
            }
          }

          const latest = await updateUgcClip(payload.projectId, clip.id, {
            stills: nextStills,
            status: UgcClipStatus.IDLE,
            error: undefined,
          })
          liveClips = latest?.clips ?? liveClips.map(item =>
            item.id === clip.id ? { ...item, stills: nextStills, status: UgcClipStatus.IDLE } : item,
          )
        } catch (error) {
          failed = true
          logger.error('UGC still failed', { clipId: clip.id, error })
          await updateUgcClip(payload.projectId, clip.id, {
            status: UgcClipStatus.FAILED,
            error: 'Photo generation failed',
          })
          break
        }
      }

      const latestClips = liveClips
      await updateUgcClip(
        payload.projectId,
        targets[0]!.id,
        {},
        {
          status: projectStatusFromClips(latestClips),
          error: failed ? 'Photo generation failed' : undefined,
        },
      )

      setGenerationStatus(100, failed ? 'Finished with errors' : 'Photos ready')
      return { projectId: payload.projectId, clipId: payload.clipId ?? targets[0]!.id }
    } catch (error) {
      setGenerationFailure(error, 'Photo generation failed')
      const clipId = payload.clipId
      if (clipId) {
        const latest = await updateUgcClip(payload.projectId, clipId, {
          status: UgcClipStatus.FAILED,
          error: error instanceof Error ? error.message : 'Photo generation failed',
        }).catch(() => undefined)
        await updateUgcClip(
          payload.projectId,
          clipId,
          {},
          {
            status: projectStatusFromClips(latest?.clips ?? []),
            error: error instanceof Error ? error.message : 'Photo generation failed',
          },
        ).catch(() => undefined)
      }
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type GenerateUgcStillsTask = typeof generateUgcStills
