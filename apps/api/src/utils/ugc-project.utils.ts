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
  UgcVoiceProvider,
  type IUgcClip,
  type IUgcClipAudioTake,
  type IUgcProject,
  type IUgcSceneStill,
} from '@socialista/db'
import type { UgcClip, UgcClipAudioTake, UgcClipVoice, UgcProject, UgcProjectSummary, UgcSceneStill } from '@socialista/types'
import {
  clampUgcDuration,
  clampUgcScript,
  parseVideoResolution,
  ugcClipAudioTakes,
  UGC_CLIP_TYPE_LABELS,
  UGC_CLIP_TYPES,
  UGC_DEFAULT_CLIP_TYPE,
  UGC_DEFAULT_DURATION,
  UGC_MAX_CLIPS,
  UGC_SCRIPT_MAX_CHARS,
  ugcClipSceneCount,
  ugcClipShowsScript,
  type UgcClipType as UgcClipTypeValue,
  type UgcSceneCount,
} from '@socialista/types'
import { randomUUID } from 'node:crypto'

export function emptyStills(sceneCount: number): IUgcSceneStill[] {
  return Array.from({ length: sceneCount }, (_, index) => ({ index }))
}

export function parseClipType(value: unknown): UgcClipType {
  if (value === undefined || value === null || value === '') {
    return UGC_DEFAULT_CLIP_TYPE as UgcClipType
  }
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
    sceneCount: 1,
    influencerId: variant.influencerId,
    script: {
      text: scriptText,
      source: project.script?.source ?? UgcScriptSource.USER,
    },
    directions: project.directions,
    stills: variant.stills?.slice(0, 1) ?? emptyStills(1),
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

function serializeAudioTake(take: IUgcClipAudioTake): UgcClipAudioTake {
  return {
    id: take.id,
    audioUrl: take.audioUrl,
    durationSec: take.durationSec,
    scriptText: take.scriptText,
  }
}

function serializeStill(still: IUgcSceneStill): UgcSceneStill {
  return {
    index: still.index,
    imageUrl: still.imageUrl,
    generationId: still.generationId,
    enhancedPrompt: still.enhancedPrompt,
  }
}

function serializeVoice(voice?: IUgcClip['voice']): UgcClipVoice | undefined {
  if (!voice?.provider) return undefined
  return {
    provider: voice.provider,
    ...(voice.voiceId ? { voiceId: voice.voiceId } : {}),
    ...(voice.voiceName ? { voiceName: voice.voiceName } : {}),
    ...(typeof voice.speed === 'number' ? { speed: voice.speed } : {}),
    ...(typeof voice.stability === 'number' ? { stability: voice.stability } : {}),
    ...(typeof voice.similarity === 'number' ? { similarity: voice.similarity } : {}),
    ...(typeof voice.style === 'number' ? { style: voice.style } : {}),
    ...(typeof voice.speakerBoost === 'boolean' ? { speakerBoost: voice.speakerBoost } : {}),
    ...(typeof voice.enabled === 'boolean' ? { enabled: voice.enabled } : {}),
  }
}

export function toStoredVoice(input: UgcClipVoice): IUgcClip['voice'] {
  return {
    provider: UgcVoiceProvider.ELEVENLABS,
    voiceId: input.voiceId,
    voiceName: input.voiceName,
    speed: input.speed,
    stability: input.stability,
    similarity: input.similarity,
    style: input.style,
    speakerBoost: input.speakerBoost,
    enabled: input.enabled,
  }
}

export function resolveClipInfluencerId(project: IUgcProject, clip: IUgcClip): string | undefined {
  return clip.influencerId?.toString() ?? project.influencerId?.toString()
}

export function serializeClip(clip: IUgcClip): UgcClip {
  const stills = (clip.stills ?? []).filter(still => still.imageUrl).map(serializeStill)
  const type = clipTypeValue(clip.type)
  const sceneCount = ugcClipSceneCount({ type, stills, sceneCount: clip.sceneCount })
  const audioTakes = ugcClipAudioTakes({
    audioTakes: (clip.audioTakes ?? []).filter(take => take.audioUrl).map(serializeAudioTake),
    audioUrl: clip.audioUrl,
    audioDurationSec: clip.audioDurationSec,
  })
  const selectedTake = audioTakes.find(take => take.audioUrl === clip.audioUrl) ?? audioTakes.at(-1)
  return {
    id: clip.id,
    type,
    name: clip.name,
    status: clip.status,
    durationSec: clip.durationSec ?? UGC_DEFAULT_DURATION,
    sceneCount,
    influencerId: clip.influencerId?.toString(),
    script: clip.script
      ? { text: clip.script.text ?? '', source: clip.script.source }
      : { text: '', source: 'user' },
    voice: serializeVoice(clip.voice),
    models: clip.models
      ? {
          ...(clip.models.image ? { image: clip.models.image } : {}),
          ...(clip.models.video ? { video: clip.models.video } : {}),
          ...(clip.models.script ? { script: clip.models.script } : {}),
          ...(clip.models.planner ? { planner: clip.models.planner } : {}),
        }
      : undefined,
    scenePrompt: clip.scenePrompt,
    directions: clip.directions,
    referenceImageUrls: clip.referenceImageUrls ?? [],
    stills: stills.map((still, index) => ({ ...still, index })),
    plannedPrompt: clip.plannedPrompt,
    negativePrompt: clip.negativePrompt,
    audioUrl: clip.audioUrl ?? selectedTake?.audioUrl,
    audioDurationSec: clip.audioDurationSec ?? selectedTake?.durationSec,
    audioTakes,
    videoUrl: clip.videoUrl,
    thumbnailUrl: clip.thumbnailUrl,
    generationId: clip.generationId,
    composedVideoId: clip.composedVideoId?.toString(),
    stillsRunId: clip.stillsRunId,
    videoRunId: clip.videoRunId,
    audioRunId: clip.audioRunId,
    approved: clip.approved,
    error: clip.error,
  }
}

export function serializeUgcProject(project: IUgcProject): UgcProject {
  const clips = migrateLegacyClips(project)
  const campaignInfluencerId =
    project.influencerId?.toString() ?? clips.find(clip => clip.influencerId)?.influencerId?.toString()
  return {
    id: project._id.toString(),
    name: project.name,
    status: project.status,
    workspaceId: project.workspace.toString(),
    ...(project.project ? { projectId: project.project.toString() } : {}),
    createdBy: project.createdBy.toString(),
    productId: project.productId?.toString(),
    productImageUrls: project.productImageUrls ?? [],
    productName: project.productName,
    productDescription: project.productDescription,
    productUrl: project.productUrl,
    productKind: project.productKind,
    influencerId: campaignInfluencerId,
    voice: serializeVoice(project.voice),
    aspectRatio: project.aspectRatio,
    videoResolution: parseVideoResolution(project.videoResolution),
    models: {
      image: project.models.image,
      video: project.models.video,
      ...(project.models.script ? { script: project.models.script } : {}),
      ...(project.models.planner ? { planner: project.models.planner } : {}),
    },
    flowStep: project.flowStep,
    clips: clips.map(serializeClip),
    assembledVideoUrl: project.assembledVideoUrl,
    assembledRunId: project.assembledRunId,
    composedProjectVideoId: project.composedProjectVideoId?.toString(),
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
    ...(project.project ? { projectId: project.project.toString() } : {}),
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

export function assertCanGenerateScript(clip: IUgcClip) {
  const type = clipTypeValue(clip.type)
  if (!ugcClipShowsScript(type)) {
    throw new HttpError(400, 'This scene has no spoken audio')
  }
}

export function assertClipLimit(project: IUgcProject) {
  if ((project.clips?.length ?? 0) >= UGC_MAX_CLIPS) {
    throw new HttpError(400, `You can add at most ${UGC_MAX_CLIPS} clips in a project`)
  }
}

export function buildNewClip(input: {
  type?: UgcClipType
  durationSec?: number
  sceneCount?: UgcSceneCount
  influencerId?: string
  name?: string
}): IUgcClip {
  const resolvedType = input.type ?? parseClipType(UGC_DEFAULT_CLIP_TYPE)
  const type = clipTypeValue(resolvedType)
  const durationSec = clampUgcDuration(input.durationSec ?? UGC_DEFAULT_DURATION)
  const sceneCount = 1
  const skipInfluencer = type === 'b-roll' || type === 'hook'
  return {
    id: randomUUID(),
    type: resolvedType,
    name: input.name?.trim() || UGC_CLIP_TYPE_LABELS[type],
    status: UgcClipStatus.IDLE,
    durationSec,
    sceneCount,
    ...(input.influencerId && !skipInfluencer ? { influencerId: toObjectId(input.influencerId) } : {}),
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
