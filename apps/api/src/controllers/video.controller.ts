import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId } from '@/utils/common.utils.js'
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
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
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
import type { CreateVideoPayload, DuplicateVideoPayload, UpdateVideoPayload } from '@socialista/types'
import type { Context } from 'hono'

export const createVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = (await c.req.json()) as CreateVideoPayload
  const workspaceId = parseParamId(input.workspaceId, 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Untitled video'

  const video = await createVideoInDb({
    name,
    status: VideoStatus.DRAFT,
    workspace: toObjectId(workspaceId),
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

  const params = new URLSearchParams(getQueryString(c.req.url))
  params.set('workspace', workspaceId)

  const data = await getVideos(params.toString())
  return successResponse(c, 200, {
    videos: data.videos.map(video => serializeVideoSummary(video as IVideo)),
    meta: data.meta,
  })
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
