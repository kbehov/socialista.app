import { HttpError } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  getUgcProjectById,
  toObjectId,
  updateUgcProject,
  UgcClipStatus,
  UgcClipType,
  UgcProjectStatus,
  UgcScriptSource,
  type IUgcClip,
  type IUgcProject,
  type IUgcSceneStill,
} from '@socialista/db'
import type { UgcClip, UgcProject, UgcProjectSummary, UgcSceneStill } from '@socialista/types'
import {
  clampUgcDuration,
  clampUgcScript,
  UGC_CLIP_DEFAULT_SCENE_COUNT,
  UGC_CLIP_TYPE_LABELS,
  UGC_CLIP_TYPES,
  UGC_DEFAULT_DURATION,
  UGC_MAX_CLIPS,
  UGC_SCRIPT_MAX_CHARS,
  ugcClipRequiresCreator,
  ugcClipRequiresProduct,
  ugcClipRequiresScreenshots,
  ugcClipRequiresScript,
  type UgcClipType as UgcClipTypeValue,
} from '@socialista/types'
import { randomUUID } from 'node:crypto'

export function emptyStills(sceneCount: number): IUgcSceneStill[] {
  return Array.from({ length: sceneCount }, (_, index) => ({ index }))
}

export function parseClipType(value: unknown): UgcClipType {
  if (typeof value === 'string' && (UGC_CLIP_TYPES as readonly string[]).includes(value)) {
    return value as UgcClipType
  }
  throw new HttpError(400, 'Choose a clip type')
}

export function clipTypeValue(type: UgcClipType): UgcClipTypeValue {
  return type
}

export function migrateLegacyClips(project: IUgcProject): IUgcClip[] {
  if (project.clips && project.clips.length > 0) return project.clips
  const variants = project.variants ?? []
  if (variants.length === 0) return []

  const scriptText = clampUgcScript(project.script?.text ?? '')
  return variants.map(variant => ({
    id: variant.id,
    type: UgcClipType.PRODUCT_HOLD,
    name: `${UGC_CLIP_TYPE_LABELS['product-hold']} · ${UGC_DEFAULT_DURATION}s`,
    status: variant.status,
    durationSec: UGC_DEFAULT_DURATION,
    influencerId: variant.influencerId,
    script: {
      text: scriptText,
      source: project.script?.source ?? UgcScriptSource.USER,
    },
    directions: project.directions,
    stills: variant.stills ?? emptyStills(UGC_CLIP_DEFAULT_SCENE_COUNT['product-hold']),
    plannedPrompt: variant.plannedPrompt,
    negativePrompt: variant.negativePrompt,
    videoUrl: variant.videoUrl,
    thumbnailUrl: variant.thumbnailUrl,
    generationId: variant.generationId,
    composedVideoId: variant.composedVideoId,
    error: variant.error,
  }))
}

export async function persistMigratedClips(project: IUgcProject): Promise<IUgcProject> {
  if (project.clips && project.clips.length > 0) return project
  const clips = migrateLegacyClips(project)
  if (clips.length === 0) {
    return { ...project, clips: [] }
  }
  const updated = await updateUgcProject(project._id.toString(), { clips })
  return updated ?? { ...project, clips }
}

function serializeStill(still: IUgcSceneStill): UgcSceneStill {
  return {
    index: still.index,
    imageUrl: still.imageUrl,
    generationId: still.generationId,
    enhancedPrompt: still.enhancedPrompt,
  }
}

export function serializeClip(clip: IUgcClip): UgcClip {
  return {
    id: clip.id,
    type: clip.type,
    name: clip.name,
    status: clip.status,
    durationSec: clip.durationSec ?? UGC_DEFAULT_DURATION,
    influencerId: clip.influencerId?.toString(),
    script: clip.script
      ? { text: clip.script.text ?? '', source: clip.script.source }
      : { text: '', source: 'user' },
    scenePrompt: clip.scenePrompt,
    directions: clip.directions,
    referenceImageUrls: clip.referenceImageUrls ?? [],
    stills: (clip.stills ?? []).map(serializeStill),
    plannedPrompt: clip.plannedPrompt,
    negativePrompt: clip.negativePrompt,
    videoUrl: clip.videoUrl,
    thumbnailUrl: clip.thumbnailUrl,
    generationId: clip.generationId,
    composedVideoId: clip.composedVideoId?.toString(),
    stillsRunId: clip.stillsRunId,
    videoRunId: clip.videoRunId,
    error: clip.error,
  }
}

export function serializeUgcProject(project: IUgcProject): UgcProject {
  const clips = migrateLegacyClips(project)
  return {
    id: project._id.toString(),
    name: project.name,
    status: project.status,
    workspaceId: project.workspace.toString(),
    createdBy: project.createdBy.toString(),
    productId: project.productId?.toString(),
    productImageUrls: project.productImageUrls ?? [],
    productName: project.productName,
    aspectRatio: project.aspectRatio,
    models: {
      image: project.models.image,
      video: project.models.video,
      ...(project.models.script ? { script: project.models.script } : {}),
      ...(project.models.planner ? { planner: project.models.planner } : {}),
    },
    clips: clips.map(serializeClip),
    error: project.error,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

export function serializeUgcProjectSummary(project: IUgcProject): UgcProjectSummary {
  const clips = migrateLegacyClips(project)
  const preview =
    clips.find(clip => clip.thumbnailUrl)?.thumbnailUrl ??
    clips.find(clip => clip.stills[0]?.imageUrl)?.stills[0]?.imageUrl ??
    project.productImageUrls[0]

  return {
    id: project._id.toString(),
    name: project.name,
    status: project.status,
    workspaceId: project.workspace.toString(),
    productImageUrls: project.productImageUrls ?? [],
    clipCount: clips.length,
    readyCount: clips.filter(clip => clip.status === UgcClipStatus.READY).length,
    previewImageUrl: preview,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

export async function getUgcProjectForMember(id: string, userId: string) {
  const project = await getUgcProjectById(id)
  if (!project) {
    throw new HttpError(404, 'UGC project not found')
  }
  await getWorkspaceAsMember(project.workspace.toString(), userId)
  return persistMigratedClips(project)
}

export function requireClip(project: IUgcProject, clipId: string | undefined): IUgcClip {
  if (!clipId) throw new HttpError(400, 'clip ID is required')
  const clip = (project.clips ?? []).find(item => item.id === clipId)
  if (!clip) throw new HttpError(404, 'Clip not found')
  return clip
}

export function assertClipNotGenerating(clip: IUgcClip) {
  if (clip.status === UgcClipStatus.GENERATING) {
    throw new HttpError(409, 'This clip is already generating. Wait for it to finish.')
  }
}

export function assertCanGenerateStills(project: IUgcProject, clip: IUgcClip) {
  const type = clipTypeValue(clip.type)
  if (!project.models.image) {
    throw new HttpError(400, 'Choose an image model')
  }
  if (ugcClipRequiresProduct(type) && project.productImageUrls.length === 0) {
    throw new HttpError(400, 'Add a product photo first')
  }
  if (ugcClipRequiresCreator(type) && !clip.influencerId) {
    throw new HttpError(400, 'Pick a creator for this clip')
  }
  if (ugcClipRequiresScreenshots(type) && (clip.referenceImageUrls?.length ?? 0) === 0) {
    throw new HttpError(400, 'Add app screenshots first')
  }
}

export function assertCanGenerateVideo(project: IUgcProject, clip: IUgcClip) {
  if (!project.models.video) {
    throw new HttpError(400, 'Choose a video model')
  }
  if (!clip.stills.some(still => still.imageUrl)) {
    throw new HttpError(400, 'Generate scenes before video')
  }
}

export function assertCanGenerateScript(clip: IUgcClip) {
  const type = clipTypeValue(clip.type)
  if (!ugcClipRequiresScript(type) && type === 'b-roll') {
    throw new HttpError(400, 'B-roll clips do not use a spoken script')
  }
}

export function assertClipLimit(project: IUgcProject) {
  if ((project.clips?.length ?? 0) >= UGC_MAX_CLIPS) {
    throw new HttpError(400, `You can add at most ${UGC_MAX_CLIPS} clips in a project`)
  }
}

export function buildNewClip(input: {
  type: UgcClipType
  durationSec?: number
  influencerId?: string
  name?: string
}): IUgcClip {
  const type = clipTypeValue(input.type)
  const durationSec = clampUgcDuration(input.durationSec ?? UGC_DEFAULT_DURATION)
  const sceneCount = UGC_CLIP_DEFAULT_SCENE_COUNT[type]
  return {
    id: randomUUID(),
    type: input.type,
    name: input.name?.trim() || `${UGC_CLIP_TYPE_LABELS[type]} · ${durationSec}s`,
    status: UgcClipStatus.IDLE,
    durationSec,
    ...(input.influencerId ? { influencerId: toObjectId(input.influencerId) } : {}),
    script: { text: '', source: UgcScriptSource.USER },
    stills: emptyStills(sceneCount),
    referenceImageUrls: [],
  }
}

export function parseScriptText(value: unknown): string {
  if (typeof value !== 'string') return ''
  if (value.length > UGC_SCRIPT_MAX_CHARS) {
    throw new HttpError(400, `Script must be ${UGC_SCRIPT_MAX_CHARS} characters or fewer`)
  }
  return value
}
