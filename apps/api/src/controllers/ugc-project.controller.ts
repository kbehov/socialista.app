import type { AppContext } from '@/middlewares/auth.middleware.js'
import { parseParamId, withQueryParam } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  assertCanGenerateStills,
  assertCanGenerateVideo,
  assertNotGenerating,
  getUgcProjectForMember,
  parseSceneCount,
  parseVariantIds,
  serializeUgcProject,
  serializeUgcProjectSummary,
  syncVariants,
} from '@/utils/ugc-project.utils.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  DEFAULT_VIDEO_FPS,
  DEFAULT_VIDEO_RESOLUTION,
} from '@/utils/video.utils.js'
import { generateUgcAdScript } from '@socialista/ai'
import {
  createUgcProject as createUgcProjectInDb,
  createVideo as createVideoInDb,
  deleteUgcProject as deleteUgcProjectInDb,
  getModels,
  getProductById,
  getUgcProjects,
  toObjectId,
  updateUgcProject as updateUgcProjectInDb,
  UgcProjectStatus,
  UgcScriptSource,
  VideoStatus,
  type IUgcProject,
  type IUgcProjectModels,
} from '@socialista/db'
import { createPublicAccessToken } from '@socialista/trigger'
import type { GenerateUgcStillsTask, GenerateUgcVideoTask } from '@socialista/trigger/task-types'
import {
  TASK_IDS,
  UGC_DEFAULT_ASPECT_RATIO,
  UGC_MAX_VARIANTS,
  type CreateUgcProjectPayload,
  type UpdateUgcProjectPayload,
} from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'
import type { Context } from 'hono'

async function resolveDefaultModels(): Promise<IUgcProjectModels> {
  const [image, video, text] = await Promise.all([
    getModels('limit=1&modelType=text-to-image&contextSupports=image&sort=-usageCount'),
    getModels('limit=1&modelType=image-to-video&sort=-usageCount'),
    getModels('limit=1&modelType=text&contextSupports=image&sort=-usageCount'),
  ])

  const imageModel = image.models[0]
  const videoModel = video.models[0]
  const plannerModel = text.models[0]

  if (!imageModel || !videoModel) {
    throw new HttpError(400, 'Add image-context and image-to-video models in the catalog first')
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

  const defaults = await resolveDefaultModels()
  const sceneCount = parseSceneCount(input.sceneCount)
  const influencerIds = (input.influencerIds ?? []).slice(0, UGC_MAX_VARIANTS)
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
    createdBy: toObjectId(userId),
    ...(productId ? { productId: toObjectId(productId) } : {}),
    productImageUrls,
    productName,
    influencerIds: influencerIds.map(id => toObjectId(parseParamId(id, 'influencer ID'))),
    sceneCount,
    aspectRatio: input.aspectRatio || UGC_DEFAULT_ASPECT_RATIO,
    models,
    script: {
      text: input.script?.text ?? '',
      source: input.script?.source === 'ai' ? UgcScriptSource.AI : UgcScriptSource.USER,
    },
    directions: typeof input.directions === 'string' ? input.directions : undefined,
    variants: syncVariants([], influencerIds, sceneCount),
  })

  return successResponse(c, 201, { project: serializeUgcProject(project.toObject() as IUgcProject) })
}

export const getWorkspaceUgcProjects = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getUgcProjects(withQueryParam(c.req.url, 'workspace', workspaceId))
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
  if (input.productId === null) {
    updates.productId = undefined
  } else if (typeof input.productId === 'string' && input.productId) {
    updates.productId = toObjectId(parseParamId(input.productId, 'product ID'))
  }
  if (input.sceneCount !== undefined) updates.sceneCount = parseSceneCount(input.sceneCount)
  if (typeof input.aspectRatio === 'string' && input.aspectRatio) updates.aspectRatio = input.aspectRatio
  if (typeof input.directions === 'string') updates.directions = input.directions
  if (input.directions === null) updates.directions = undefined
  if (input.models) {
    updates.models = {
      ...project.models,
      ...(input.models.image ? { image: input.models.image } : {}),
      ...(input.models.video ? { video: input.models.video } : {}),
      ...(input.models.script ? { script: input.models.script } : {}),
      ...(input.models.planner ? { planner: input.models.planner } : {}),
    }
  }
  if (input.script) {
    updates.script = {
      text: typeof input.script.text === 'string' ? input.script.text : project.script.text,
      source: input.script.source === 'ai' ? UgcScriptSource.AI : UgcScriptSource.USER,
    }
  }

  const nextSceneCount = updates.sceneCount ?? project.sceneCount
  const nextInfluencerIds = Array.isArray(input.influencerIds)
    ? input.influencerIds.slice(0, UGC_MAX_VARIANTS).map(influencerId => parseParamId(influencerId, 'influencer ID'))
    : project.influencerIds.map(influencerId => influencerId.toString())

  if (Array.isArray(input.influencerIds)) {
    updates.influencerIds = nextInfluencerIds.map(influencerId => toObjectId(influencerId))
  }

  if (Array.isArray(input.influencerIds) || input.sceneCount !== undefined) {
    updates.variants = syncVariants(project.variants, nextInfluencerIds, nextSceneCount)
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

export const generateUgcScript = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const body = (await c.req.json().catch(() => ({}))) as { model?: string }
  const project = await getUgcProjectForMember(id, userId)

  const modelValue = body.model || project.models.script
  if (!modelValue) {
    throw new HttpError(400, 'Choose a script model')
  }

  const text = await generateUgcAdScript({
    model: modelValue,
    productName: project.productName,
    directions: project.directions,
  })

  const updated = await updateUgcProjectInDb(id, {
    script: { text, source: UgcScriptSource.AI },
    models: { ...project.models, script: modelValue },
  })
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const generateUgcStills = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const body = (await c.req.json().catch(() => ({}))) as { variantIds?: string[]; stillIndex?: number }
  let project = await getUgcProjectForMember(id, userId)
  assertNotGenerating(project)

  if (project.variants.length === 0 && project.influencerIds.length > 0) {
    const synced = await updateUgcProjectInDb(id, {
      variants: syncVariants([], project.influencerIds.map(influencerId => influencerId.toString()), project.sceneCount),
    })
    if (synced) project = synced
  }

  assertCanGenerateStills(project)
  const variantIds = parseVariantIds(body.variantIds)
  const handle = await tasks.trigger<GenerateUgcStillsTask>(TASK_IDS.generateUgcStills, {
    projectId: id,
    workspaceId: project.workspace.toString(),
    userId,
    variantIds,
    stillIndex: typeof body.stillIndex === 'number' ? body.stillIndex : undefined,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  const updated = await updateUgcProjectInDb(id, {
    status: UgcProjectStatus.GENERATING,
    stillsRunId: handle.id,
  })

  return successResponse(c, 202, {
    project: serializeUgcProject(updated ?? project),
    runId: handle.id,
    publicAccessToken,
  })
}

export const generateUgcVideos = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const body = (await c.req.json().catch(() => ({}))) as {
    variantIds?: string[]
    plannedPrompt?: string
    skipPlanner?: boolean
  }
  const project = await getUgcProjectForMember(id, userId)
  assertNotGenerating(project)
  assertCanGenerateVideo(project)
  const variantIds = parseVariantIds(body.variantIds)

  const handle = await tasks.trigger<GenerateUgcVideoTask>(TASK_IDS.generateUgcVideo, {
    projectId: id,
    workspaceId: project.workspace.toString(),
    userId,
    variantIds,
    plannedPrompt: typeof body.plannedPrompt === 'string' ? body.plannedPrompt : undefined,
    skipPlanner: body.skipPlanner === true,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  const updated = await updateUgcProjectInDb(id, {
    status: UgcProjectStatus.GENERATING,
    videoRunId: handle.id,
  })

  return successResponse(c, 202, {
    project: serializeUgcProject(updated ?? project),
    runId: handle.id,
    publicAccessToken,
  })
}

export const regenerateUgcStill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const variantId = c.req.param('variantId')
  const index = Number(c.req.param('index'))
  if (!variantId) throw new HttpError(400, 'variant ID is required')
  if (!Number.isInteger(index) || index < 0 || index > 2) {
    throw new HttpError(400, 'Invalid scene index')
  }

  const project = await getUgcProjectForMember(id, userId)
  assertNotGenerating(project)
  assertCanGenerateStills(project)

  const handle = await tasks.trigger<GenerateUgcStillsTask>(TASK_IDS.generateUgcStills, {
    projectId: id,
    workspaceId: project.workspace.toString(),
    userId,
    variantIds: [variantId],
    stillIndex: index,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  await updateUgcProjectInDb(id, { status: UgcProjectStatus.GENERATING, stillsRunId: handle.id })

  return successResponse(c, 202, {
    project: serializeUgcProject(project),
    runId: handle.id,
    publicAccessToken,
  })
}

export const regenerateUgcVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const variantId = c.req.param('variantId')
  if (!variantId) throw new HttpError(400, 'variant ID is required')
  const body = (await c.req.json().catch(() => ({}))) as { plannedPrompt?: string; skipPlanner?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  assertNotGenerating(project)
  assertCanGenerateVideo(project)

  const handle = await tasks.trigger<GenerateUgcVideoTask>(TASK_IDS.generateUgcVideo, {
    projectId: id,
    workspaceId: project.workspace.toString(),
    userId,
    variantIds: [variantId],
    plannedPrompt: typeof body.plannedPrompt === 'string' ? body.plannedPrompt : undefined,
    skipPlanner: body.skipPlanner === true,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  await updateUgcProjectInDb(id, { status: UgcProjectStatus.GENERATING, videoRunId: handle.id })

  return successResponse(c, 202, {
    project: serializeUgcProject(project),
    runId: handle.id,
    publicAccessToken,
  })
}

export const openUgcVariantEditor = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const variantId = c.req.param('variantId')
  if (!variantId) throw new HttpError(400, 'variant ID is required')
  const project = await getUgcProjectForMember(id, userId)
  const variant = project.variants.find(item => item.id === variantId)
  if (!variant?.videoUrl) {
    throw new HttpError(400, 'Generate a video first')
  }

  if (variant.composedVideoId) {
    return successResponse(c, 200, { videoId: variant.composedVideoId.toString() })
  }

  const duration = 8
  const assetId = `asset_${variant.id}`
  const clipId = `clip_${variant.id}`
  const trackId = `track_${variant.id}`

  const video = await createVideoInDb({
    name: `${project.name} · cut`,
    status: VideoStatus.DRAFT,
    workspace: project.workspace,
    createdBy: toObjectId(userId),
    resolution: DEFAULT_VIDEO_RESOLUTION,
    fps: DEFAULT_VIDEO_FPS,
    duration,
    tracks: [{ id: trackId, type: 'video', name: 'Video', muted: false, locked: false, clips: [clipId] }],
    clips: [
      {
        id: clipId,
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
        hash: variant.id,
        duration,
        width: DEFAULT_VIDEO_RESOLUTION.width,
        height: DEFAULT_VIDEO_RESOLUTION.height,
        url: variant.videoUrl,
      },
    ],
  })

  const nextVariants = project.variants.map(item =>
    item.id === variantId ? { ...item, composedVideoId: video._id } : item,
  )
  await updateUgcProjectInDb(id, { variants: nextVariants })

  return successResponse(c, 201, { videoId: video._id.toString() })
}
