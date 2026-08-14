import { createVideo, toObjectId, VideoStatus } from '@socialista/db'
import type { VideoAspectRatio } from '@socialista/types'
import { randomUUID } from 'node:crypto'

const ASPECT_RESOLUTION: Record<VideoAspectRatio, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '16:9': { width: 1920, height: 1080 },
  '1:1': { width: 1080, height: 1080 },
}

function nameFromPrompt(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, ' ')
  if (!trimmed) return 'Generated video'
  if (trimmed.length <= 48) return trimmed
  return `${trimmed.slice(0, 45).trim()}…`
}

export async function createGeneratedVideoProject(input: {
  workspaceId: string
  userId: string
  prompt: string
  videoUrl: string
  durationSec: number
  aspectRatio: VideoAspectRatio
}): Promise<string> {
  const resolution = ASPECT_RESOLUTION[input.aspectRatio] ?? { width: 1080, height: 1920 }
  const assetId = `asset_${randomUUID()}`
  const clipId = `clip_${randomUUID()}`
  const trackId = `track_${randomUUID()}`
  const duration = input.durationSec
  const name = nameFromPrompt(input.prompt)

  const video = await createVideo({
    name,
    status: VideoStatus.DRAFT,
    workspace: toObjectId(input.workspaceId),
    createdBy: toObjectId(input.userId),
    resolution,
    fps: 30,
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
        name: `${name}.mp4`,
        type: 'video',
        hash: assetId,
        duration,
        width: resolution.width,
        height: resolution.height,
        url: input.videoUrl,
      },
    ],
  })

  return video._id.toString()
}
