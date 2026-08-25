import type { AppContext } from '@/middlewares/auth.middleware.js'
import { applyProjectQueryAlias, withQueryParam, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  cloneVideoTimeline,
  DEFAULT_VIDEO_FPS,
  DEFAULT_VIDEO_RESOLUTION,
  getVideoForMember,
  parseVideoStatus,
  serializeVideoDoc,
  serializeVideoSummary,
} from '@/utils/video.utils.js'
import { getWorkspaceAsMember, resolveProjectForWorkspace } from '@/utils/workspace.utils.js'
import {
  createVideo as createVideoInDb,
  deleteVideo as deleteVideoInDb,
  getVideos,
  toObjectId,
  updateVideo as updateVideoInDb,
  type DbClip,
  type DbSerializedMediaAsset,
  type DbTextOverlay,
  type DbTrack,
  type IVideo,
  VideoStatus,
} from '@socialista/db'
import { createPublicAccessToken } from '@socialista/trigger'
import type { ExportVideoTask } from '@socialista/trigger/task-types'
import {
  TASK_IDS,
  type CreateVideoPayload,
  type DuplicateVideoPayload,
  type ExportSettings,
  type UpdateVideoPayload,
} from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'
import type { Context } from 'hono'

const VALID_QUALITIES = new Set(['low', 'medium', 'high'])
const VALID_FPS = new Set([24, 30, 60])

function parseExportSettings(raw: unknown): ExportSettings {
  if (!raw || typeof raw !== 'object') {
    throw new HttpError(400, 'settings is required')
  }
  const settings = raw as Record<string, unknown>
  const resolution = settings.resolution
  if (!resolution || typeof resolution !== 'object') {
    throw new HttpError(400, 'settings.resolution is required')
  }
  const { width, height } = resolution as Record<string, unknown>
  if (typeof width !== 'number' || typeof height !== 'number' || width < 1 || height < 1) {
    throw new HttpError(400, 'settings.resolution must include positive width and height')
  }
  if (typeof settings.fps !== 'number' || !VALID_FPS.has(settings.fps)) {
    throw new HttpError(400, 'settings.fps must be 24, 30, or 60')
  }
  if (typeof settings.quality !== 'string' || !VALID_QUALITIES.has(settings.quality)) {
    throw new HttpError(400, 'settings.quality must be low, medium, or high')
  }
  return {
    resolution: { width, height },
    fps: settings.fps,
    quality: settings.quality as ExportSettings['quality'],
  }
}

export const createVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = (await c.req.json()) as CreateVideoPayload
  const workspaceId = parseParamId(input.workspaceId, 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)
  const project = await resolveProjectForWorkspace(workspaceId, input.projectId)

  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Untitled video'

  const video = await createVideoInDb({
    name,
    status: VideoStatus.DRAFT,
    workspace: toObjectId(workspaceId),
    project: toObjectId(project._id.toString()),
    createdBy: toObjectId(userId),
    resolution: input.resolution ?? DEFAULT_VIDEO_RESOLUTION,
    fps: input.fps ?? DEFAULT_VIDEO_FPS,
    duration: input.duration ?? 0,
    tracks: (input.tracks ?? []) as unknown as DbTrack[],
    clips: Object.values(input.clips ?? {}) as unknown as DbClip[],
    textOverlays: (input.textOverlays ?? []) as unknown as DbTextOverlay[],
    assets: (input.assets ?? []) as unknown as DbSerializedMediaAsset[],
  })

  return successResponse(c, 201, { video: serializeVideoDoc(video.toObject()) })
}

export const getWorkspaceVideos = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getVideos(
    applyProjectQueryAlias(withQueryParam(c.req.url, 'workspace', workspaceId)),
  )
  return successResponse(
    c,
    200,
    { videos: data.videos.map(video => serializeVideoSummary(video as IVideo)) },
    data.meta,
  )
}

export const getVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'video ID')
  const video = await getVideoForMember(id, userId)
  return successResponse(c, 200, { video: serializeVideoDoc(video as IVideo) })
}

export const updateVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'video ID')
  const input = (await c.req.json()) as UpdateVideoPayload
  await getVideoForMember(id, userId)

  const updates: Partial<IVideo> = {}
  if (typeof input.name === 'string' && input.name.trim()) {
    updates.name = input.name.trim()
  }
  const status = parseVideoStatus(input.status)
  if (status) {
    updates.status = status
  }
  if (input.resolution) {
    updates.resolution = input.resolution
  }
  if (typeof input.fps === 'number') {
    updates.fps = input.fps
  }
  if (typeof input.duration === 'number') {
    updates.duration = input.duration
  }
  if (Array.isArray(input.tracks)) {
    updates.tracks = input.tracks as unknown as DbTrack[]
  }
  if (input.clips) {
    updates.clips = Object.values(input.clips) as unknown as DbClip[]
  }
  if (Array.isArray(input.textOverlays)) {
    updates.textOverlays = input.textOverlays as unknown as DbTextOverlay[]
  }
  if (Array.isArray(input.assets)) {
    updates.assets = input.assets as unknown as DbSerializedMediaAsset[]
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }

  const video = await updateVideoInDb(id, updates)
  if (!video) {
    throw new HttpError(404, 'Video not found')
  }

  return successResponse(c, 200, { video: serializeVideoDoc(video as IVideo) })
}

export const deleteVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'video ID')
  await getVideoForMember(id, userId)

  const deleted = await deleteVideoInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Video not found')
  }

  return successResponse(c, 200, { id })
}

export const duplicateVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'video ID')
  const source = await getVideoForMember(id, userId)

  let input: DuplicateVideoPayload = {}
  try {
    input = (await c.req.json()) as DuplicateVideoPayload
  } catch {
    input = {}
  }

  const requestedName = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : ''
  const name = requestedName || `${source.name} (copy)`
  const { tracks, clips, textOverlays } = cloneVideoTimeline(source)

  const video = await createVideoInDb({
    name,
    status: VideoStatus.DRAFT,
    workspace: source.workspace,
    ...(source.project ? { project: source.project } : {}),
    createdBy: toObjectId(userId),
    resolution: source.resolution,
    fps: source.fps,
    duration: source.duration,
    tracks,
    clips,
    textOverlays,
    assets: source.assets,
  })

  return successResponse(c, 201, { video: serializeVideoDoc(video.toObject()) })
}

export const exportVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'video ID')
  const video = await getVideoForMember(id, userId)

  const body = (await c.req.json()) as { settings?: unknown }
  const settings = parseExportSettings(body.settings)

  if (!video.clips.length) {
    throw new HttpError(400, 'Add clips to the timeline before exporting')
  }

  const assetsById = new Map(video.assets.map(asset => [asset.id, asset]))
  for (const clip of video.clips) {
    const asset = assetsById.get(clip.assetId)
    if (!asset?.url) {
      throw new HttpError(400, 'Save your video before exporting')
    }
  }

  const handle = await tasks.trigger<ExportVideoTask>(TASK_IDS.videoExport, {
    videoId: id,
    workspaceId: video.workspace.toString(),
    userId,
    settings,
  })

  const publicAccessToken = await createPublicAccessToken(handle.id)

  return successResponse(c, 202, {
    runId: handle.id,
    publicAccessToken,
  })
}
