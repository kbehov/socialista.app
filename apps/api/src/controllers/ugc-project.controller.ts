import type { AppContext } from '@/middlewares/auth.middleware.js'
import { parseParamId, withQueryParam, applyProjectQueryAlias } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  assertCanAssemble,
  assertCanGenerateAudio,
  assertCanGenerateScript,
  assertCanGenerateStills,
  assertCanGenerateVideo,
  assertClipLimit,
  assertClipNotGenerating,
  buildNewClip,
  clipTypeValue,
  emptyStills,
  getUgcProjectForMember,
  parseClipType,
  parseScriptText,
  requireClip,
  resolveClipInfluencerId,
  serializeUgcProject,
  serializeUgcProjectSummary,
  toStoredVoice,
} from '@/utils/ugc-project.utils.js'
import { getWorkspaceAsMember, resolveProjectForWorkspace } from '@/utils/workspace.utils.js'
import { DEFAULT_VIDEO_FPS, DEFAULT_VIDEO_RESOLUTION } from '@/utils/video.utils.js'
import { generateUgcAdScript, generateUgcAdScriptSegments, searchUgcVoices } from '@socialista/ai'
import {
  addUgcClip,
  addUgcClips,
  createUgcProject as createUgcProjectInDb,
  createVideo as createVideoInDb,
  deleteUgcProject as deleteUgcProjectInDb,
  getInfluencerById,
  getModels,
  getProductById,
  getSkillById,
  getUgcProjects,
  incrementSkillUsage,
  removeUgcClip,
  toObjectId,
  updateUgcClip,
  updateUgcProject as updateUgcProjectInDb,
  UgcClipStatus,
  UgcFlowStep,
  UgcProductKind,
  UgcProjectStatus,
  UgcScriptSource,
  VideoStatus,
  type IUgcClip,
  type IUgcProject,
  type IUgcProjectModels,
} from '@socialista/db'
import { createPublicAccessToken } from '@socialista/trigger'
import type {
  GenerateUgcStillsTask,
  GenerateUgcVideoTask,
  GenerateUgcAudioTask,
  AssembleUgcProjectTask,
} from '@socialista/trigger/task-types'
import {
  clampUgcDuration,
  clampImageGenerationCount,
  parseUgcCampaignPresetId,
  parseUgcFlowStep,
  parseUgcProductKind,
  PROMPT_KEYS,
  TASK_IDS,
  UGC_CAMPAIGN_PRESETS,
  UGC_CLIP_TYPE_LABELS,
  UGC_DEFAULT_ASPECT_RATIO,
  UGC_DEFAULT_DURATION,
  UGC_MAX_CLIPS,
  ugcClipShowsScript,
  ugcResolvedClipVoice,
  type ApplyUgcCampaignPresetPayload,
  type CreateUgcClipPayload,
  type CreateUgcProjectPayload,
  type SearchUgcVoicesQuery,
  type UpdateUgcClipPayload,
  type UpdateUgcProjectPayload,
} from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'
import type { Context } from 'hono'

async function resolveDefaultModels(): Promise<IUgcProjectModels> {
  const [image, video, text] = await Promise.all([
    getModels('limit=1&modelType=image&contextSupports=image&sort=-usageCount'),
    getModels('limit=1&modelType=video&contextSupports=image&sort=-usageCount'),
    getModels('limit=1&modelType=text&contextSupports=image&sort=-usageCount'),
  ])

  const imageModel = image.models[0]
  const videoModel = video.models[0]
  const plannerModel = text.models[0]

  if (!imageModel || !videoModel) {
    throw new HttpError(400, 'Add image-context and video models in the catalog first')
  }

  const scriptOnly = plannerModel
    ? plannerModel
    : (await getModels('limit=1&modelType=text&sort=-usageCount')).models[0]

  return {
    image: imageModel.value,
    video: videoModel.value,
    ...(scriptOnly ? { script: scriptOnly.value } : {}),
    ...(plannerModel ? { planner: plannerModel.value } : {}),
  }
}

export const createUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = (await c.req.json()) as CreateUgcProjectPayload
  const workspaceId = parseParamId(input.workspaceId, 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)
  const studioProject = await resolveProjectForWorkspace(workspaceId, input.projectId)

  const defaults = await resolveDefaultModels()
  const productImageUrls = input.productImageUrls?.filter(url => typeof url === 'string' && url.length > 0) ?? []

  let productName = typeof input.productName === 'string' ? input.productName.trim() : undefined
  let productId: string | undefined
  if (typeof input.productId === 'string' && input.productId) {
    productId = parseParamId(input.productId, 'product ID')
    const product = await getProductById(productId)
    if (product) {
      if (productImageUrls.length === 0) {
        productImageUrls.push(...(product.images ?? []))
      }
      productName = productName || product.name
    }
  }

  const models: IUgcProjectModels = {
    image: input.models?.image || defaults.image,
    video: input.models?.video || defaults.video,
    script: input.models?.script || defaults.script,
    planner: input.models?.planner || defaults.planner,
  }

  const project = await createUgcProjectInDb({
    name: typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Untitled UGC ad',
    status: UgcProjectStatus.DRAFT,
    workspace: toObjectId(workspaceId),
    project: toObjectId(studioProject._id.toString()),
    createdBy: toObjectId(userId),
    ...(productId ? { productId: toObjectId(productId) } : {}),
    productImageUrls,
    productName,
    ...(typeof input.productDescription === 'string' ? { productDescription: input.productDescription.trim() } : {}),
    ...(typeof input.productUrl === 'string' ? { productUrl: input.productUrl.trim() } : {}),
    ...(parseUgcProductKind(input.productKind)
      ? { productKind: parseUgcProductKind(input.productKind) as UgcProductKind }
      : {}),
    aspectRatio: input.aspectRatio || UGC_DEFAULT_ASPECT_RATIO,
    models,
    flowStep: UgcFlowStep.PRODUCT,
    clips: [],
  })

  return successResponse(c, 201, { project: serializeUgcProject(project.toObject() as IUgcProject) })
}

export const getWorkspaceUgcProjects = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getUgcProjects(
    applyProjectQueryAlias(withQueryParam(c.req.url, 'workspace', workspaceId)),
  )
  return successResponse(
    c,
    200,
    { projects: data.projects.map(project => serializeUgcProjectSummary(project as IUgcProject)) },
    data.meta,
  )
}

export const getUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const project = await getUgcProjectForMember(id, userId)
  return successResponse(c, 200, { project: serializeUgcProject(project) })
}

export const updateUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const input = (await c.req.json()) as UpdateUgcProjectPayload
  const project = await getUgcProjectForMember(id, userId)

  const updates: Partial<IUgcProject> = {}
  if (typeof input.name === 'string' && input.name.trim()) updates.name = input.name.trim()
  if (Array.isArray(input.productImageUrls)) {
    updates.productImageUrls = input.productImageUrls.filter(url => typeof url === 'string')
  }
  if (typeof input.productName === 'string') updates.productName = input.productName.trim()
  if (typeof input.productDescription === 'string') updates.productDescription = input.productDescription.trim()
  if (input.productDescription === null) updates.productDescription = undefined
  if (typeof input.productUrl === 'string') updates.productUrl = input.productUrl.trim()
  if (input.productUrl === null) updates.productUrl = undefined
  const productKind = parseUgcProductKind(input.productKind)
  if (productKind) updates.productKind = productKind as UgcProductKind
  if (input.productKind === null) updates.productKind = undefined
  const flowStep = parseUgcFlowStep(input.flowStep)
  if (flowStep) updates.flowStep = flowStep as UgcFlowStep
  if (input.productId === null) {
    updates.productId = undefined
  } else if (typeof input.productId === 'string' && input.productId) {
    updates.productId = toObjectId(parseParamId(input.productId, 'product ID'))
  }
  if (input.influencerId === null) {
    updates.influencerId = undefined
  } else if (typeof input.influencerId === 'string' && input.influencerId) {
    const nextId = toObjectId(parseParamId(input.influencerId, 'influencer ID'))
    updates.influencerId = nextId
    const previousId = project.influencerId?.toString()
    updates.clips = (project.clips ?? []).map(clip => {
      if (clipTypeValue(clip.type) === 'b-roll') return clip
      const currentId = clip.influencerId?.toString()
      if (!currentId || currentId === previousId) {
        return { ...clip, influencerId: nextId }
      }
      return clip
    })
  }
  if (input.voice === null) {
    updates.voice = undefined
  } else if (input.voice) {
    updates.voice = toStoredVoice(input.voice)
  }
  if (typeof input.aspectRatio === 'string' && input.aspectRatio) updates.aspectRatio = input.aspectRatio
  if (input.models) {
    updates.models = {
      ...project.models,
      ...(input.models.image ? { image: input.models.image } : {}),
      ...(input.models.video ? { video: input.models.video } : {}),
      ...(input.models.script ? { script: input.models.script } : {}),
      ...(input.models.planner ? { planner: input.models.planner } : {}),
    }
  }
  if (Array.isArray(input.clipOrder) && input.clipOrder.length > 0) {
    const byId = new Map((project.clips ?? []).map(clip => [clip.id, clip]))
    const next: IUgcClip[] = []
    for (const id of input.clipOrder) {
      const clip = byId.get(id)
      if (clip) {
        next.push(clip)
        byId.delete(id)
      }
    }
    for (const clip of byId.values()) next.push(clip)
    updates.clips = next
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }

  const updated = await updateUgcProjectInDb(id, updates)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const deleteUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  await getUgcProjectForMember(id, userId)
  const deleted = await deleteUgcProjectInDb(id)
  if (!deleted) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 200, { id })
}

export const createUgcClip = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const input = (await c.req.json()) as CreateUgcClipPayload
  const project = await getUgcProjectForMember(id, userId)
  assertClipLimit(project)

  const type = parseClipType(input.type)
  const influencerId =
    typeof input.influencerId === 'string' && input.influencerId
      ? parseParamId(input.influencerId, 'influencer ID')
      : project.influencerId?.toString()

  const clip = buildNewClip({
    type,
    durationSec: input.durationSec,
    sceneCount: input.sceneCount,
    influencerId,
    name: input.name,
  })
  const updated = await addUgcClip(id, clip)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 201, { project: serializeUgcProject(updated) })
}

export const applyUgcCampaignPreset = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const input = (await c.req.json()) as ApplyUgcCampaignPresetPayload
  const project = await getUgcProjectForMember(id, userId)
  const presetId = parseUgcCampaignPresetId(input.presetId)
  const preset = UGC_CAMPAIGN_PRESETS.find(item => item.id === presetId)
  if (!preset) throw new HttpError(400, 'Unknown campaign preset')

  const remaining = UGC_MAX_CLIPS - (project.clips?.length ?? 0)
  if (remaining <= 0) {
    throw new HttpError(400, `You can add at most ${UGC_MAX_CLIPS} clips in a project`)
  }

  const beats = preset.beats.slice(0, remaining)
  const influencerId = project.influencerId?.toString()
  const clips = beats.map(beat =>
    buildNewClip({
      type: parseClipType(beat.type),
      durationSec: beat.durationSec,
      influencerId,
      name: beat.name,
    }),
  )

  const updated = await addUgcClips(id, clips)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 201, { project: serializeUgcProject(updated) })
}

export const updateUgcClipHandler = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const input = (await c.req.json()) as UpdateUgcClipPayload
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipNotGenerating(clip)

  const clipUpdates: Partial<IUgcClip> = {}
  if (typeof input.name === 'string' && input.name.trim()) clipUpdates.name = input.name.trim()
  if (input.type) {
    const nextType = parseClipType(input.type)
    const nextTypeValue = clipTypeValue(nextType)
    clipUpdates.type = nextType
    const hasImages = (clip.stills ?? []).some(still => still.imageUrl)
    if (!hasImages) {
      clipUpdates.sceneCount = 1
      clipUpdates.stills = emptyStills(1)
    }
    if (nextTypeValue === 'b-roll') {
      clipUpdates.influencerId = undefined
    }
    const previousLabel = UGC_CLIP_TYPE_LABELS[clipTypeValue(clip.type)]
    if (!input.name && (!clip.name || clip.name.startsWith(previousLabel))) {
      clipUpdates.name = UGC_CLIP_TYPE_LABELS[nextTypeValue]
    }
  }
  if (input.durationSec !== undefined) {
    clipUpdates.durationSec = clampUgcDuration(input.durationSec)
  }
  if (typeof input.approved === 'boolean') {
    clipUpdates.approved = input.approved
  }
  if (input.influencerId === null) {
    clipUpdates.influencerId = undefined
  } else if (typeof input.influencerId === 'string' && input.influencerId) {
    clipUpdates.influencerId = toObjectId(parseParamId(input.influencerId, 'influencer ID'))
  }
  if (input.script) {
    clipUpdates.script = {
      text: typeof input.script.text === 'string' ? parseScriptText(input.script.text) : (clip.script?.text ?? ''),
      source: input.script.source === 'ai' ? UgcScriptSource.AI : UgcScriptSource.USER,
    }
  }
  if (input.voice === null) {
    clipUpdates.voice = undefined
  } else   if (input.voice) {
    clipUpdates.voice = toStoredVoice(input.voice)
  }
  if (input.models) {
    clipUpdates.models = {
      ...clip.models,
      ...(input.models.image ? { image: input.models.image } : {}),
      ...(input.models.video ? { video: input.models.video } : {}),
      ...(input.models.script ? { script: input.models.script } : {}),
      ...(input.models.planner ? { planner: input.models.planner } : {}),
    }
  }
  if (typeof input.scenePrompt === 'string') clipUpdates.scenePrompt = input.scenePrompt
  if (input.scenePrompt === null) clipUpdates.scenePrompt = undefined
  if (typeof input.directions === 'string') clipUpdates.directions = input.directions
  if (input.directions === null) clipUpdates.directions = undefined
  if (Array.isArray(input.referenceImageUrls)) {
    clipUpdates.referenceImageUrls = input.referenceImageUrls.filter(url => typeof url === 'string')
  }
  if (typeof input.plannedPrompt === 'string') clipUpdates.plannedPrompt = input.plannedPrompt
  if (input.plannedPrompt === null) clipUpdates.plannedPrompt = undefined
  if (Array.isArray(input.stills)) {
    clipUpdates.stills = input.stills.flatMap((still, index) => {
      if (!still || typeof still !== 'object') return []
      const imageUrl = typeof still.imageUrl === 'string' ? still.imageUrl : undefined
      if (!imageUrl) return []
      return [
        {
          index: typeof still.index === 'number' ? still.index : index,
          imageUrl,
          generationId: typeof still.generationId === 'string' ? still.generationId : undefined,
          enhancedPrompt: typeof still.enhancedPrompt === 'string' ? still.enhancedPrompt : undefined,
        },
      ]
    })
  }
  if (input.audioUrl === null) {
    clipUpdates.audioUrl = undefined
    clipUpdates.audioDurationSec = undefined
  } else if (typeof input.audioUrl === 'string' && input.audioUrl) {
    clipUpdates.audioUrl = input.audioUrl
  }

  if (Object.keys(clipUpdates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }

  const updated = await updateUgcClip(id, clip.id, clipUpdates)
  if (!updated) throw new HttpError(404, 'Clip not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const deleteUgcClip = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipNotGenerating(clip)
  const updated = await removeUgcClip(id, clip.id)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const duplicateUgcClip = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipLimit(project)

  const copy = buildNewClip({
    type: clip.type,
    durationSec: clip.durationSec,
    influencerId: clip.influencerId?.toString() ?? project.influencerId?.toString(),
    name: clip.name ? `${clip.name} copy` : UGC_CLIP_TYPE_LABELS[clipTypeValue(clip.type)],
  })
  copy.script = clip.script ? { ...clip.script } : copy.script
  copy.scenePrompt = clip.scenePrompt
  copy.directions = clip.directions
  copy.voice = clip.voice ? { ...clip.voice } : copy.voice
  copy.referenceImageUrls = [...(clip.referenceImageUrls ?? [])]
  copy.stills = emptyStills(1)

  const updated = await addUgcClip(id, copy)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 201, { project: serializeUgcProject(updated) })
}

export const generateUgcClipScript = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { model?: string; skillId?: string }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipNotGenerating(clip)
  assertCanGenerateScript(clip)

  const modelValue = body.model || clip.models?.script || project.models.script
  if (!modelValue) {
    throw new HttpError(400, 'Choose a script model')
  }

  const influencerId = resolveClipInfluencerId(project, clip)
  const influencer = influencerId ? await getInfluencerById(influencerId) : null
  const durationSec = clip.durationSec ?? UGC_DEFAULT_DURATION
  const workspaceId = project.workspace.toString()
  let systemOverride: string | undefined
  if (body.skillId) {
    try {
      const skill = await getSkillById(body.skillId)
      if (
        skill &&
        skill.workspaceId.toString() === workspaceId &&
        skill.target === PROMPT_KEYS.ugcAdScript
      ) {
        systemOverride = skill.content
        await incrementSkillUsage(skill._id.toString()).catch(() => undefined)
      }
    } catch {
      // Invalid or missing skill — use the registry default.
    }
  }

  const text = await generateUgcAdScript({
    productName: project.productName,
    directions: clip.directions || clip.scenePrompt,
    influencerName: influencer?.name,
    clipType: clip.type,
    durationSec,
    systemOverride,
  })

  const updated = await updateUgcClip(id, clip.id, {
    script: { text, source: UgcScriptSource.AI },
  })
  if (!updated) throw new HttpError(404, 'Clip not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const generateUgcProjectScript = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const body = (await c.req.json().catch(() => ({}))) as { model?: string; skillId?: string }
  const project = await getUgcProjectForMember(id, userId)
  const clips = project.clips ?? []
  if (clips.length === 0) {
    throw new HttpError(400, 'Add a scene first')
  }
  for (const clip of clips) {
    assertClipNotGenerating(clip)
  }

  const modelValue = body.model || project.models.script
  if (!modelValue) {
    throw new HttpError(400, 'Choose a script model')
  }

  const influencerId = project.influencerId?.toString()
  const influencer = influencerId ? await getInfluencerById(influencerId) : null
  const workspaceId = project.workspace.toString()
  let systemOverride: string | undefined
  if (body.skillId) {
    try {
      const skill = await getSkillById(body.skillId)
      if (
        skill &&
        skill.workspaceId.toString() === workspaceId &&
        skill.target === PROMPT_KEYS.ugcAdScript
      ) {
        systemOverride = skill.content
        await incrementSkillUsage(skill._id.toString()).catch(() => undefined)
      }
    } catch {
      // Invalid or missing skill — use the registry default.
    }
  }

  const segments = await generateUgcAdScriptSegments({
    productName: project.productName,
    productDescription: project.productDescription,
    productKind: project.productKind,
    influencerName: influencer?.name,
    directions: project.clips?.find(clip => clip.directions || clip.scenePrompt)?.directions,
    scenes: clips.map(clip => ({
      id: clip.id,
      type: clipTypeValue(clip.type),
      durationSec: clip.durationSec,
    })),
    systemOverride,
  })

  let latest = project
  for (const segment of segments) {
    const clip = clips.find(item => item.id === segment.clipId)
    if (!clip) continue
    if (!ugcClipShowsScript(clipTypeValue(clip.type))) {
      const updated = await updateUgcClip(id, clip.id, {
        script: { text: '', source: UgcScriptSource.AI },
      })
      if (updated) latest = updated
      continue
    }
    const updated = await updateUgcClip(id, clip.id, {
      script: { text: segment.text, source: UgcScriptSource.AI },
    })
    if (updated) latest = updated
  }

  return successResponse(c, 200, { project: serializeUgcProject(latest) })
}

async function triggerStills(
  project: IUgcProject,
  userId: string,
  options?: {
    clipId?: string
    skipEnhance?: boolean
    prompt?: string
    model?: string
    referenceImageUrls?: string[]
    count?: number
  },
) {
  if (options?.clipId) {
    const clip = requireClip(project, options.clipId)
    assertClipNotGenerating(clip)
    assertCanGenerateStills(project, clip)
  } else {
    if ((project.clips ?? []).length === 0) {
      throw new HttpError(400, 'Add a scene first')
    }
    for (const clip of project.clips ?? []) {
      assertClipNotGenerating(clip)
      assertCanGenerateStills(project, clip)
    }
  }

  const count = options?.count ? clampImageGenerationCount(options.count) : undefined
  const prompt = options?.prompt?.trim() || undefined
  const model = options?.model?.trim() || undefined
  const referenceImageUrls = options?.referenceImageUrls?.filter(url => typeof url === 'string' && url.length > 0)

  const handle = await tasks.trigger<GenerateUgcStillsTask>(TASK_IDS.generateUgcStills, {
    projectId: project._id.toString(),
    workspaceId: project.workspace.toString(),
    userId,
    ...(options?.clipId ? { clipId: options.clipId } : {}),
    ...(options?.skipEnhance ? { skipEnhance: true } : {}),
    ...(prompt ? { prompt } : {}),
    ...(model ? { model } : {}),
    ...(referenceImageUrls && referenceImageUrls.length > 0 ? { referenceImageUrls } : {}),
    ...(count ? { count } : {}),
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  const targets = options?.clipId
    ? [requireClip(project, options.clipId)]
    : (project.clips ?? [])
  if (targets.length === 0) throw new HttpError(400, 'Add a scene first')

  let latest = project
  for (const clip of targets) {
    const updated = await updateUgcClip(
      project._id.toString(),
      clip.id,
      {
        status: UgcClipStatus.GENERATING,
        stillsRunId: handle.id,
        error: undefined,
        ...(model ? { models: { ...clip.models, image: model } } : {}),
      },
      {
        status: UgcProjectStatus.GENERATING,
        stillsRunId: handle.id,
        error: undefined,
        ...(model ? { models: { ...project.models, image: model } } : {}),
      },
    )
    if (updated) latest = updated
  }

  return {
    project: serializeUgcProject(latest),
    runId: handle.id,
    publicAccessToken,
  }
}

async function triggerVideo(
  project: IUgcProject,
  clip: IUgcClip,
  userId: string,
  options?: { plannedPrompt?: string; skipPlanner?: boolean },
) {
  assertClipNotGenerating(clip)
  assertCanGenerateVideo(project, clip)

  const handle = await tasks.trigger<GenerateUgcVideoTask>(TASK_IDS.generateUgcVideo, {
    projectId: project._id.toString(),
    workspaceId: project.workspace.toString(),
    userId,
    clipId: clip.id,
    plannedPrompt: options?.plannedPrompt,
    skipPlanner: options?.skipPlanner,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  const updated = await updateUgcClip(
    project._id.toString(),
    clip.id,
    { status: UgcClipStatus.GENERATING, videoRunId: handle.id, error: undefined },
    { status: UgcProjectStatus.GENERATING, videoRunId: handle.id, error: undefined },
  )

  return {
    project: serializeUgcProject(updated ?? project),
    runId: handle.id,
    publicAccessToken,
  }
}

export const generateUgcClipStills = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as {
    skipEnhance?: boolean
    prompt?: string
    model?: string
    referenceImageUrls?: string[]
    count?: number
  }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerStills(project, userId, {
    clipId: clip.id,
    skipEnhance: body.skipEnhance === true,
    prompt: typeof body.prompt === 'string' ? body.prompt : undefined,
    model: typeof body.model === 'string' ? body.model : undefined,
    referenceImageUrls: Array.isArray(body.referenceImageUrls) ? body.referenceImageUrls : undefined,
    count: typeof body.count === 'number' ? body.count : undefined,
  })
  return successResponse(c, 202, result)
}

export const generateUgcProjectStills = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const body = (await c.req.json().catch(() => ({}))) as { skipEnhance?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const result = await triggerStills(project, userId, {
    skipEnhance: body.skipEnhance === true,
  })
  return successResponse(c, 202, result)
}

export const generateUgcClipVideos = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { plannedPrompt?: string; skipPlanner?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerVideo(project, clip, userId, {
    plannedPrompt: typeof body.plannedPrompt === 'string' ? body.plannedPrompt : undefined,
    skipPlanner: body.skipPlanner === true,
  })
  return successResponse(c, 202, result)
}

export const regenerateUgcClipStill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const index = Number(c.req.param('index'))
  if (!Number.isInteger(index) || index !== 0) {
    throw new HttpError(400, 'Invalid photo index')
  }
  const body = (await c.req.json().catch(() => ({}))) as { skipEnhance?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerStills(project, userId, {
    clipId: clip.id,
    skipEnhance: body.skipEnhance === true,
  })
  return successResponse(c, 202, result)
}

export const regenerateUgcClipVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { plannedPrompt?: string; skipPlanner?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerVideo(project, clip, userId, {
    plannedPrompt: typeof body.plannedPrompt === 'string' ? body.plannedPrompt : undefined,
    skipPlanner: body.skipPlanner === true,
  })
  return successResponse(c, 202, result)
}

export const openUgcClipEditor = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  if (!clip.videoUrl) {
    throw new HttpError(400, 'Generate a video first')
  }

  if (clip.composedVideoId) {
    return successResponse(c, 200, { videoId: clip.composedVideoId.toString() })
  }

  const duration = clip.durationSec || UGC_DEFAULT_DURATION
  const assetId = `asset_${clip.id}`
  const timelineClipId = `clip_${clip.id}`
  const trackId = `track_${clip.id}`

  const video = await createVideoInDb({
    name: `${project.name} · ${clip.name ?? 'cut'}`,
    status: VideoStatus.DRAFT,
    workspace: project.workspace,
    createdBy: toObjectId(userId),
    resolution: DEFAULT_VIDEO_RESOLUTION,
    fps: DEFAULT_VIDEO_FPS,
    duration,
    tracks: [{ id: trackId, type: 'video', name: 'Video', muted: false, locked: false, clips: [timelineClipId] }],
    clips: [
      {
        id: timelineClipId,
        type: 'video',
        assetId,
        trackId,
        startTime: 0,
        duration,
        trimIn: 0,
        trimOut: duration,
        volume: 1,
        speed: 1,
        filters: [],
      },
    ],
    textOverlays: [],
    assets: [
      {
        id: assetId,
        name: `${project.name}.mp4`,
        type: 'video',
        hash: clip.id,
        duration,
        width: DEFAULT_VIDEO_RESOLUTION.width,
        height: DEFAULT_VIDEO_RESOLUTION.height,
        url: clip.videoUrl,
      },
    ],
  })

  await updateUgcClip(id, clip.id, { composedVideoId: video._id })
  return successResponse(c, 201, { videoId: video._id.toString() })
}

export const generateUgcProjectVideos = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const body = (await c.req.json().catch(() => ({}))) as { plannedPrompt?: string; skipPlanner?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const targets = (project.clips ?? []).filter(
    clip => clip.approved && clip.stills.some(still => Boolean(still.imageUrl)),
  )
  if (targets.length === 0) {
    throw new HttpError(400, 'Approve at least one photo first')
  }

  let live = project
  let last = {
    project: serializeUgcProject(project),
    runId: '',
    publicAccessToken: '',
  }
  for (const clip of targets) {
    const current = requireClip(live, clip.id)
    last = await triggerVideo(live, current, userId, {
      plannedPrompt: typeof body.plannedPrompt === 'string' ? body.plannedPrompt : undefined,
      skipPlanner: body.skipPlanner === true,
    })
    live = (await getUgcProjectForMember(id, userId)) ?? live
  }
  return successResponse(c, 202, last)
}

export const assembleUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const project = await getUgcProjectForMember(id, userId)
  assertCanAssemble(project)

  const handle = await tasks.trigger<AssembleUgcProjectTask>(TASK_IDS.assembleUgcProject, {
    projectId: project._id.toString(),
    workspaceId: project.workspace.toString(),
    userId,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  const updated = await updateUgcProjectInDb(id, {
    status: UgcProjectStatus.GENERATING,
    assembledRunId: handle.id,
    error: undefined,
  })

  return successResponse(c, 202, {
    project: serializeUgcProject(updated ?? project),
    runId: handle.id,
    publicAccessToken,
  })
}

export const openUgcProjectEditor = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const project = await getUgcProjectForMember(id, userId)

  if (project.composedProjectVideoId) {
    return successResponse(c, 200, { videoId: project.composedProjectVideoId.toString() })
  }

  const readyClips = (project.clips ?? []).filter(clip => Boolean(clip.videoUrl))
  if (readyClips.length === 0) {
    throw new HttpError(400, 'Generate at least one clip video first')
  }

  let cursor = 0
  const tracks = [{ id: 'track_ugc', type: 'video' as const, name: 'Video', muted: false, locked: false, clips: [] as string[] }]
  const clips = []
  const assets = []

  for (const clip of readyClips) {
    const duration = clip.durationSec || UGC_DEFAULT_DURATION
    const assetId = `asset_${clip.id}`
    const timelineClipId = `clip_${clip.id}`
    tracks[0]!.clips.push(timelineClipId)
    clips.push({
      id: timelineClipId,
      type: 'video' as const,
      assetId,
      trackId: 'track_ugc',
      startTime: cursor,
      duration,
      trimIn: 0,
      trimOut: duration,
      volume: 1,
      speed: 1,
      filters: [],
    })
    assets.push({
      id: assetId,
      name: `${clip.name ?? clip.id}.mp4`,
      type: 'video' as const,
      hash: clip.id,
      duration,
      width: DEFAULT_VIDEO_RESOLUTION.width,
      height: DEFAULT_VIDEO_RESOLUTION.height,
      url: clip.videoUrl as string,
    })
    cursor += duration
  }

  const video = await createVideoInDb({
    name: `${project.name} · assembled`,
    status: VideoStatus.DRAFT,
    workspace: project.workspace,
    createdBy: toObjectId(userId),
    resolution: DEFAULT_VIDEO_RESOLUTION,
    fps: DEFAULT_VIDEO_FPS,
    duration: cursor,
    tracks,
    clips,
    textOverlays: [],
    assets,
  })

  await updateUgcProjectInDb(id, { composedProjectVideoId: video._id })
  return successResponse(c, 201, { videoId: video._id.toString() })
}

async function triggerAudio(
  project: IUgcProject,
  userId: string,
  options?: { clipId?: string; text?: string },
) {
  const clipId = options?.clipId
  let latest = project
  const incoming = options?.text?.trim()
  if (clipId && incoming) {
    const saved = await updateUgcClip(project._id.toString(), clipId, {
      script: { text: parseScriptText(incoming), source: UgcScriptSource.USER },
    })
    if (!saved) throw new HttpError(404, 'Clip not found')
    latest = saved
  }

  const serialized = serializeUgcProject(latest)
  const clips = clipId
    ? [requireClip(latest, clipId)]
    : (latest.clips ?? []).filter(clip => ugcClipShowsScript(clipTypeValue(clip.type)))

  if (clips.length === 0) {
    throw new HttpError(400, clipId ? 'Clip not found' : 'Add a talking scene first')
  }

  const targets: IUgcClip[] = []
  for (const clip of clips) {
    assertClipNotGenerating(clip)
    const serializedClip = serialized.clips.find(item => item.id === clip.id)
    const voice = ugcResolvedClipVoice(serialized, serializedClip)
    if (voice.enabled === false) {
      if (clipId) throw new HttpError(400, 'Voiceover is turned off for this scene')
      continue
    }
    const text = (clipId === clip.id ? incoming : undefined) || clip.script?.text.trim()
    if (!text) {
      if (clipId) throw new HttpError(400, 'Write a script before generating audio')
      continue
    }
    assertCanGenerateAudio({ ...clip, script: { text, source: clip.script?.source ?? UgcScriptSource.USER } })
    targets.push(clip)
  }

  if (targets.length === 0) {
    throw new HttpError(400, 'Write a script on a talking scene first')
  }

  const scriptText = clipId ? incoming || targets[0]?.script?.text.trim() : undefined
  const handle = await tasks.trigger<GenerateUgcAudioTask>(TASK_IDS.generateUgcAudio, {
    projectId: latest._id.toString(),
    workspaceId: latest.workspace.toString(),
    userId,
    ...(clipId ? { clipId } : {}),
    ...(scriptText ? { text: scriptText } : {}),
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)

  for (const clip of targets) {
    const updated = await updateUgcClip(
      latest._id.toString(),
      clip.id,
      { audioRunId: handle.id, error: undefined },
      { audioRunId: handle.id, error: undefined },
    )
    if (updated) latest = updated
  }

  return {
    project: serializeUgcProject(latest),
    runId: handle.id,
    publicAccessToken,
  }
}

export const searchUgcProjectVoices = async (c: Context<AppContext>) => {
  c.get('userId')
  const read = (key: string) => {
    const value = c.req.query(key)?.trim()
    return value ? value : undefined
  }
  const filters: SearchUgcVoicesQuery = {
    search: read('search'),
    language: read('language'),
    gender: read('gender'),
    age: read('age'),
    accent: read('accent'),
    category: read('category'),
  }
  const result = await searchUgcVoices({
    ...filters,
    pageSize: 40,
  })
  return successResponse(c, 200, result)
}

export const generateUgcClipAudio = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { script?: string; text?: string }
  const text = typeof body.script === 'string' ? body.script : typeof body.text === 'string' ? body.text : undefined
  const project = await getUgcProjectForMember(id, userId)
  const result = await triggerAudio(project, userId, { clipId, text })
  return successResponse(c, 202, result)
}

export const generateUgcProjectAudio = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const project = await getUgcProjectForMember(id, userId)
  const result = await triggerAudio(project, userId)
  return successResponse(c, 202, result)
}
