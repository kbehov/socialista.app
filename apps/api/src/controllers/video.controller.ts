import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { assertWorkspaceMember, getWorkspaceOrThrow } from '@/utils/workspace.utils.js'
import {
  createVideo as createVideoInDb,
  deleteVideo as deleteVideoInDb,
  getVideoById,
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
import type {
  Clip,
  ClipId,
  CreateVideoPayload,
  DuplicateVideoPayload,
  SerializedMediaAsset,
  TextOverlay,
  Track,
  UpdateVideoPayload,
  VideoResponse,
  VideoSummaryResponse,
} from '@socialista/types'
import type { Context } from 'hono'

const DEFAULT_RESOLUTION = { width: 1080, height: 1920 } as const
const DEFAULT_FPS = 30

type VideoResponseInput = {
  id: string
  name: string
  status: VideoStatus
  workspaceId: string
  createdBy: string
  resolution: IVideo['resolution']
  fps: number
  duration: number
  tracks: IVideo['tracks']
  clips: IVideo['clips']
  textOverlays: IVideo['textOverlays']
  assets: IVideo['assets']
  createdAt: Date
  updatedAt: Date
}

function createEntityId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function toApiClip(dbClip: DbClip): Clip {
  return dbClip as unknown as Clip
}

function toApiClips(dbClips: IVideo['clips']): Record<ClipId, Clip> {
  const acc: Record<ClipId, Clip> = {}
  for (const clip of dbClips) {
    acc[clip.id] = toApiClip(clip)
  }
  return acc
}

function toApiTracks(dbTracks: IVideo['tracks']): Track[] {
  return dbTracks as unknown as Track[]
}

function toApiOverlays(dbOverlays: IVideo['textOverlays']): TextOverlay[] {
  return dbOverlays as unknown as TextOverlay[]
}

function toApiAssets(dbAssets: IVideo['assets']): SerializedMediaAsset[] {
  return dbAssets as unknown as SerializedMediaAsset[]
}

function serializeVideo(video: VideoResponseInput): VideoResponse {
  return {
    id: video.id,
    name: video.name,
    status: video.status,
    workspaceId: video.workspaceId,
    createdBy: video.createdBy,
    resolution: video.resolution,
    fps: video.fps,
    duration: video.duration,
    tracks: toApiTracks(video.tracks),
    clips: toApiClips(video.clips),
    textOverlays: toApiOverlays(video.textOverlays),
    assets: toApiAssets(video.assets),
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  }
}

function serializeVideoSummary(video: IVideo): VideoSummaryResponse {
  return {
    id: video._id.toString(),
    name: video.name,
    status: video.status,
    workspaceId: video.workspace.toString(),
    resolution: video.resolution,
    fps: video.fps,
    duration: video.duration,
    trackCount: video.tracks.length,
    clipCount: video.clips.length,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  }
}

async function getVideoForMember(id: string, userId: string) {
  const video = await getVideoById(id)
  if (!video) {
    throw new HttpError(404, 'Video not found')
  }
  const workspace = await getWorkspaceOrThrow(video.workspace.toString())
  assertWorkspaceMember(workspace, userId)
  return video
}

export const createVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = (await c.req.json()) as CreateVideoPayload
  const workspaceId = parseParamId(input.workspaceId, 'workspace ID')
  const workspace = await getWorkspaceOrThrow(workspaceId)
  assertWorkspaceMember(workspace, userId)

  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Untitled video'

  const video = await createVideoInDb({
    name,
    status: VideoStatus.DRAFT,
    workspace: toObjectId(workspaceId),
    createdBy: toObjectId(userId),
    resolution: input.resolution ?? DEFAULT_RESOLUTION,
    fps: input.fps ?? DEFAULT_FPS,
    duration: input.duration ?? 0,
    tracks: (input.tracks ?? []) as unknown as DbTrack[],
    clips: Object.values(input.clips ?? {}) as unknown as DbClip[],
    textOverlays: (input.textOverlays ?? []) as unknown as DbTextOverlay[],
    assets: (input.assets ?? []) as unknown as DbSerializedMediaAsset[],
  })

  const obj = video.toObject()
  return successResponse(c, 201, {
    video: serializeVideo({
      id: obj._id.toString(),
      name: obj.name,
      status: obj.status,
      workspaceId: obj.workspace.toString(),
      createdBy: obj.createdBy.toString(),
      resolution: obj.resolution,
      fps: obj.fps,
      duration: obj.duration,
      tracks: obj.tracks,
      clips: obj.clips,
      textOverlays: obj.textOverlays,
      assets: obj.assets,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }),
  })
}

export const getWorkspaceVideos = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  const workspace = await getWorkspaceOrThrow(workspaceId)
  assertWorkspaceMember(workspace, userId)

  const existingQuery = getQueryString(c.req.url)
  const params = new URLSearchParams(existingQuery)
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
  const obj = video as IVideo
  return successResponse(c, 200, {
    video: serializeVideo({
      id: obj._id.toString(),
      name: obj.name,
      status: obj.status,
      workspaceId: obj.workspace.toString(),
      createdBy: obj.createdBy.toString(),
      resolution: obj.resolution,
      fps: obj.fps,
      duration: obj.duration,
      tracks: obj.tracks,
      clips: obj.clips,
      textOverlays: obj.textOverlays,
      assets: obj.assets,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }),
  })
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
  if (input.status === 'draft' || input.status === 'published') {
    updates.status = input.status as VideoStatus
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

  const obj = video as IVideo
  return successResponse(c, 200, {
    video: serializeVideo({
      id: obj._id.toString(),
      name: obj.name,
      status: obj.status,
      workspaceId: obj.workspace.toString(),
      createdBy: obj.createdBy.toString(),
      resolution: obj.resolution,
      fps: obj.fps,
      duration: obj.duration,
      tracks: obj.tracks,
      clips: obj.clips,
      textOverlays: obj.textOverlays,
      assets: obj.assets,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }),
  })
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

  const clonedTracks: DbTrack[] = source.tracks.map(track => ({
    ...track,
    id: createEntityId('track'),
    clips: [],
  }))

  const clonedClips: DbClip[] = source.clips.map(clip => {
    const newClipId = createEntityId('clip')
    const newTrackId = clonedTracks.find(t => t.type === (clip.type === 'audio' ? 'audio' : 'video'))?.id ?? clip.trackId
    return { ...clip, id: newClipId, trackId: newTrackId } as DbClip
  })

  for (const track of clonedTracks) {
    track.clips = clonedClips.filter(c2 => c2.trackId === track.id).map(c2 => c2.id)
  }

  const clonedOverlays: DbTextOverlay[] = source.textOverlays.map(overlay => ({
    ...overlay,
    id: createEntityId('overlay'),
  }))

  const video = await createVideoInDb({
    name,
    status: VideoStatus.DRAFT,
    workspace: source.workspace,
    createdBy: toObjectId(userId),
    resolution: source.resolution,
    fps: source.fps,
    duration: source.duration,
    tracks: clonedTracks,
    clips: clonedClips,
    textOverlays: clonedOverlays,
    assets: source.assets,
  })

  const obj = video.toObject()
  return successResponse(c, 201, {
    video: serializeVideo({
      id: obj._id.toString(),
      name: obj.name,
      status: obj.status,
      workspaceId: obj.workspace.toString(),
      createdBy: obj.createdBy.toString(),
      resolution: obj.resolution,
      fps: obj.fps,
      duration: obj.duration,
      tracks: obj.tracks,
      clips: obj.clips,
      textOverlays: obj.textOverlays,
      assets: obj.assets,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }),
  })
}
