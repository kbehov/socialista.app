import { HttpError } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  getUgcProjectById,
  toObjectId,
  UgcProjectStatus,
  UgcScriptSource,
  UgcVariantStatus,
  type IUgcProject,
  type IUgcVariant,
  type UgcSceneCount,
} from '@socialista/db'
import type { UgcProject, UgcProjectSummary, UgcVariant } from '@socialista/types'
import { UGC_DEFAULT_SCENE_COUNT, UGC_MAX_VARIANTS } from '@socialista/types'
import { randomUUID } from 'node:crypto'

export function serializeUgcProject(project: IUgcProject): UgcProject {
  return {
    id: project._id.toString(),
    name: project.name,
    status: project.status,
    workspaceId: project.workspace.toString(),
    createdBy: project.createdBy.toString(),
    productId: project.productId?.toString(),
    productImageUrls: project.productImageUrls ?? [],
    productName: project.productName,
    influencerIds: (project.influencerIds ?? []).map(id => id.toString()),
    sceneCount: project.sceneCount,
    aspectRatio: project.aspectRatio,
    models: {
      image: project.models.image,
      video: project.models.video,
      ...(project.models.script ? { script: project.models.script } : {}),
      ...(project.models.planner ? { planner: project.models.planner } : {}),
    },
    script: {
      text: project.script?.text ?? '',
      source: project.script?.source ?? UgcScriptSource.USER,
    },
    directions: project.directions,
    variants: (project.variants ?? []).map(serializeVariant),
    stillsRunId: project.stillsRunId,
    videoRunId: project.videoRunId,
    error: project.error,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

export function serializeUgcProjectSummary(project: IUgcProject): UgcProjectSummary {
  const variants = project.variants ?? []
  const preview =
    variants.find(variant => variant.thumbnailUrl)?.thumbnailUrl ??
    variants.find(variant => variant.stills[0]?.imageUrl)?.stills[0]?.imageUrl ??
    project.productImageUrls[0]

  return {
    id: project._id.toString(),
    name: project.name,
    status: project.status,
    workspaceId: project.workspace.toString(),
    productImageUrls: project.productImageUrls ?? [],
    influencerIds: (project.influencerIds ?? []).map(id => id.toString()),
    sceneCount: project.sceneCount,
    variantCount: variants.length,
    readyCount: variants.filter(variant => variant.status === UgcVariantStatus.READY).length,
    previewImageUrl: preview,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

function serializeVariant(variant: IUgcVariant): UgcVariant {
  return {
    id: variant.id,
    influencerId: variant.influencerId.toString(),
    status: variant.status,
    stills: (variant.stills ?? []).map(still => ({
      index: still.index,
      imageUrl: still.imageUrl,
      generationId: still.generationId,
    })),
    plannedPrompt: variant.plannedPrompt,
    negativePrompt: variant.negativePrompt,
    videoUrl: variant.videoUrl,
    thumbnailUrl: variant.thumbnailUrl,
    generationId: variant.generationId,
    composedVideoId: variant.composedVideoId?.toString(),
    error: variant.error,
  }
}

export async function getUgcProjectForMember(id: string, userId: string) {
  const project = await getUgcProjectById(id)
  if (!project) {
    throw new HttpError(404, 'UGC project not found')
  }
  await getWorkspaceAsMember(project.workspace.toString(), userId)
  return project
}

export function parseSceneCount(value: unknown): UgcSceneCount {
  if (value === 1 || value === 2 || value === 3) return value
  if (value === '1' || value === '2' || value === '3') return Number(value) as UgcSceneCount
  return UGC_DEFAULT_SCENE_COUNT
}

export function emptyStills(sceneCount: number) {
  return Array.from({ length: sceneCount }, (_, index) => ({ index }))
}

export function syncVariants(
  existing: IUgcVariant[],
  influencerIds: string[],
  sceneCount: number,
): IUgcVariant[] {
  const capped = influencerIds.slice(0, UGC_MAX_VARIANTS)
  const byInfluencer = new Map(existing.map(variant => [variant.influencerId.toString(), variant]))

  return capped.map(influencerId => {
    const current = byInfluencer.get(influencerId)
    if (current) {
      const stills = emptyStills(sceneCount).map((slot, index) => current.stills[index] ?? slot)
      return { ...current, stills }
    }
    return {
      id: randomUUID(),
      influencerId: toObjectId(influencerId),
      status: UgcVariantStatus.IDLE,
      stills: emptyStills(sceneCount),
    }
  })
}

export function assertNotGenerating(project: IUgcProject) {
  if (project.status === UgcProjectStatus.GENERATING) {
    throw new HttpError(409, 'This project is already generating. Wait for it to finish.')
  }
}

export function assertCanGenerateStills(project: IUgcProject) {
  if (project.productImageUrls.length === 0) {
    throw new HttpError(400, 'Add a product photo first')
  }
  if (project.influencerIds.length === 0) {
    throw new HttpError(400, 'Pick at least one creator')
  }
  if (!project.models.image) {
    throw new HttpError(400, 'Choose an image model')
  }
}

export function assertCanGenerateVideo(project: IUgcProject) {
  if (!project.models.video) {
    throw new HttpError(400, 'Choose a video model')
  }
  const ready = project.variants.some(variant => variant.stills.some(still => still.imageUrl))
  if (!ready) {
    throw new HttpError(400, 'Generate scenes before video')
  }
}

export function parseVariantIds(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const ids = raw.filter((id): id is string => typeof id === 'string' && id.length > 0)
  if (ids.length > UGC_MAX_VARIANTS) {
    throw new HttpError(400, `You can generate at most ${UGC_MAX_VARIANTS} ads at once`)
  }
  return ids
}
