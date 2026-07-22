import { HttpError } from '@/utils/http-response.js'
import { createEntityId } from '@/utils/slideshow.utils.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  getVideoById,
  VideoStatus,
  type DbClip,
  type DbTextOverlay,
  type DbTrack,
  type IVideo,
} from '@socialista/db'
import type {
  Clip,
  ClipId,
  SerializedMediaAsset,
  TextOverlay,
  Track,
  VideoResponse,
  VideoSummaryResponse,
} from '@socialista/types'

export const DEFAULT_VIDEO_RESOLUTION = { width: 1080, height: 1920 } as const
export const DEFAULT_VIDEO_FPS = 30

export function serializeVideoDoc(video: IVideo): VideoResponse {
  return {
    id: video._id.toString(),
    name: video.name,
    status: video.status,
    workspaceId: video.workspace.toString(),
    createdBy: video.createdBy.toString(),
    resolution: video.resolution,
    fps: video.fps,
    duration: video.duration,
    tracks: video.tracks as unknown as Track[],
    clips: toApiClips(video.clips),
    textOverlays: video.textOverlays as unknown as TextOverlay[],
    assets: video.assets as unknown as SerializedMediaAsset[],
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  }
}

function toApiClips(dbClips: IVideo['clips']): Record<ClipId, Clip> {
  const acc: Record<ClipId, Clip> = {}
  for (const clip of dbClips) {
    acc[clip.id] = clip as unknown as Clip
  }
  return acc
}

function getVideoPreview(video: IVideo): Pick<VideoSummaryResponse, 'previewUrl' | 'previewType'> {
  const assetsById = new Map(video.assets.map(asset => [asset.id, asset]))
  const visualClips = [...video.clips]
    .filter(clip => clip.type === 'video' || clip.type === 'image')
    .sort((a, b) => a.startTime - b.startTime)

  for (const clip of visualClips) {
    const asset = assetsById.get(clip.assetId)
    if (!asset?.url) continue
    if (asset.type === 'video' || asset.type === 'image') {
      return {
        previewUrl: asset.url,
        previewType: asset.type,
      }
    }
  }

  return {}
}

export function serializeVideoSummary(video: IVideo): VideoSummaryResponse {
  const preview = getVideoPreview(video)
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
    previewUrl: preview.previewUrl,
    previewType: preview.previewType,
  }
}

export async function getVideoForMember(id: string, userId: string) {
  const video = await getVideoById(id)
  if (!video) {
    throw new HttpError(404, 'Video not found')
  }
  await getWorkspaceAsMember(video.workspace.toString(), userId)
  return video
}

export function cloneVideoTimeline(source: IVideo): {
  tracks: DbTrack[]
  clips: DbClip[]
  textOverlays: DbTextOverlay[]
} {
  const clonedTracks: DbTrack[] = source.tracks.map(track => ({
    ...track,
    id: createEntityId('track'),
    clips: [],
  }))

  const clonedClips: DbClip[] = source.clips.map(clip => {
    const newClipId = createEntityId('clip')
    const newTrackId =
      clonedTracks.find(t => t.type === (clip.type === 'audio' ? 'audio' : 'video'))?.id ?? clip.trackId
    return { ...clip, id: newClipId, trackId: newTrackId } as DbClip
  })

  for (const track of clonedTracks) {
    track.clips = clonedClips.filter(clip => clip.trackId === track.id).map(clip => clip.id)
  }

  const clonedOverlays: DbTextOverlay[] = source.textOverlays.map(overlay => ({
    ...overlay,
    id: createEntityId('overlay'),
  }))

  return { tracks: clonedTracks, clips: clonedClips, textOverlays: clonedOverlays }
}

export function parseVideoStatus(status: unknown): VideoStatus | undefined {
  if (status === VideoStatus.DRAFT || status === VideoStatus.PUBLISHED) {
    return status
  }
  if (status === 'draft') return VideoStatus.DRAFT
  if (status === 'published') return VideoStatus.PUBLISHED
  return undefined
}
