import { generateImage } from '@socialista/ai'
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
import { STATIC_AD_MODEL, TASK_IDS, type AspectRatio } from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'

import { generateUgcImageAdPayloadSchema } from '../../schemas/generate-ugc-image-ad.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModel, loadModelAndWorkspace } from '../shared/workspace.js'

function findClip(project: IUgcProject, clipId: string): IUgcClip | undefined {
  return (project.clips ?? []).find(clip => clip.id === clipId)
}

function projectStatusFromClips(clips: IUgcClip[]): UgcProjectStatus {
  if (clips.some(clip => clip.status === UgcClipStatus.GENERATING)) return UgcProjectStatus.GENERATING
  if (clips.some(clip => clip.status === UgcClipStatus.READY)) return UgcProjectStatus.READY
  if (clips.every(clip => clip.status === UgcClipStatus.FAILED) && clips.length > 0) {
    return UgcProjectStatus.FAILED
  }
  return UgcProjectStatus.DRAFT
}

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

export const generateUgcImageAd = schemaTask({
  id: TASK_IDS.generateUgcImageAd,
  schema: generateUgcImageAdPayloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    try {
      await connectDb()
      const project = await getUgcProjectById(payload.projectId)
      if (!project) throw new Error('UGC project not found')

      const clip = findClip(project, payload.clipId)
      if (!clip) throw new Error('Clip not found')

      const productImage = payload.productImage || project.productImageUrls[0]
      if (!productImage) throw new Error('Add a product photo first')

      const preferredModel = clip.models?.image || project.models.image
      const staticAdModel = await loadModel(STATIC_AD_MODEL).catch(() => null)
      const modelValue = staticAdModel?.value ?? preferredModel
      const { model, workspace } = await loadModelAndWorkspace(modelValue, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost)

      await updateUgcClip(
        payload.projectId,
        clip.id,
        {
          status: UgcClipStatus.GENERATING,
          error: undefined,
          imageAdRunId: ctx.run.id,
        },
        { status: UgcProjectStatus.GENERATING, error: undefined },
      )

      const influencerId = clip.influencerId?.toString() ?? project.influencerId?.toString()
      const influencer = influencerId ? await getInfluencerById(influencerId) : null
      const imageUrls = [
        productImage,
        ...(influencer ? influencerRefs(influencer) : []),
        ...(clip.referenceImageUrls ?? []),
      ].filter((url, index, list) => list.indexOf(url) === index)

      const aspectRatio = (
        payload.aspectRatio === '1:1' ||
        payload.aspectRatio === '16:9' ||
        payload.aspectRatio === '4:3' ||
        payload.aspectRatio === '9:16'
          ? payload.aspectRatio
          : project.aspectRatio === '1:1' ||
              project.aspectRatio === '16:9' ||
              project.aspectRatio === '4:3' ||
              project.aspectRatio === '9:16'
            ? project.aspectRatio
            : '9:16'
      ) satisfies AspectRatio

      const prompt = [
        payload.prompt?.trim() ||
          `Scroll-stopping Meta static ad of this product. ${project.productName ? `Product: ${project.productName}.` : ''} Phone-native, not a cinematic luxury commercial.`,
        payload.language ? `On-image copy language: ${payload.language}.` : '',
        influencer?.name ? `Creator look matches ${influencer.name}.` : '',
        'Preserve the exact product from Image 1. No watermarks.',
      ]
        .filter(Boolean)
        .join(' ')

      const triggerRunId = `${ctx.run.id}:${clip.id}:image-ad`
      const started = await startGenerationRecord({
        kind: GenerationKind.STATIC_AD,
        taskId: TASK_IDS.generateUgcImageAd,
        triggerRunId,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        prompt,
        model,
        inputs: {
          aspectRatio,
          productImageUrl: productImage,
          language: payload.language,
          ugcProjectId: payload.projectId,
          ugcClipId: clip.id,
        },
      })

      setGenerationStatus(25, 'Rendering image ad')

      try {
        const imageUrl = await generateImage(
          {
            model: model.value,
            provider: model.modelProvider,
            prompt,
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
        })

        const latest = await updateUgcClip(payload.projectId, clip.id, {
          imageAdUrl: imageUrl,
          imageAdGenerationId: started.generationId,
          status: clip.videoUrl ? UgcClipStatus.READY : UgcClipStatus.IDLE,
          error: undefined,
        })
        const clips = (latest?.clips ?? []).map(item =>
          item.id === clip.id ? { ...item, status: clip.videoUrl ? UgcClipStatus.READY : UgcClipStatus.IDLE } : item,
        )
        await updateUgcClip(
          payload.projectId,
          clip.id,
          {},
          { status: projectStatusFromClips(clips), error: undefined },
        )

        setGenerationStatus(100, 'Image ad ready')
        return { projectId: payload.projectId, clipId: clip.id, imageUrl }
      } catch (error) {
        await failGenerationRecord({
          triggerRunId,
          error,
          startedAt: started.startedAt,
        })
        throw error
      }
    } catch (error) {
      setGenerationFailure(error, 'Image ad generation failed')
      const latest = await updateUgcClip(payload.projectId, payload.clipId, {
        status: UgcClipStatus.FAILED,
        error: error instanceof Error ? error.message : 'Image ad generation failed',
      })
      const clips = (latest?.clips ?? []).map(item =>
        item.id === payload.clipId ? { ...item, status: UgcClipStatus.FAILED } : item,
      )
      await updateUgcClip(
        payload.projectId,
        payload.clipId,
        {},
        { status: projectStatusFromClips(clips), error: error instanceof Error ? error.message : undefined },
      )
      throw error
    } finally {
      await disconnectDb()
    }
  },
})
