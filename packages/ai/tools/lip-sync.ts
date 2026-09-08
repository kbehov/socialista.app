import { z } from 'zod'

import { fal } from '../fal.js'
import { downloadRemoteVideo, uploadGeneratedVideo } from '../utils/video-upload.js'

const DEFAULT_MODEL = 'fal-ai/heygen/v3/lipsync/precision'

const FalLipSyncResult = z
  .object({
    video: z.object({ url: z.string() }).optional(),
    video_url: z.string().optional(),
  })
  .refine(data => Boolean(data.video?.url ?? data.video_url), {
    message: 'No video was returned from the lip-sync model',
  })

export type LipSyncInput = {
  videoUrl: string
  audioUrl: string
  title?: string
  enableCaption?: boolean
  enableDynamicDuration?: boolean
  disableMusicTrack?: boolean
  enableSpeechEnhancement?: boolean
  startTime?: number
  endTime?: number
  workspaceId?: string
  userId?: string
  onProgress?: (progress: number, label: string) => void
}

function mapQueueStatus(status: string | undefined): { progress: number; label: string } | null {
  switch (status) {
    case 'IN_QUEUE':
      return { progress: 50, label: 'Waiting in queue' }
    case 'IN_PROGRESS':
      return { progress: 65, label: 'Lip-syncing' }
    case 'COMPLETED':
      return { progress: 90, label: 'Finalizing' }
    default:
      return null
  }
}

export async function lipSync({
  videoUrl,
  audioUrl,
  title,
  enableCaption,
  enableDynamicDuration,
  disableMusicTrack,
  enableSpeechEnhancement,
  startTime,
  endTime,
  workspaceId,
  userId,
  onProgress,
}: LipSyncInput): Promise<string> {
  const input: Record<string, unknown> = {
    video_url: videoUrl,
    audio_url: audioUrl,
  }

  if (title) input.title = title
  if (enableCaption !== undefined) input.enable_caption = enableCaption
  if (enableDynamicDuration !== undefined) input.enable_dynamic_duration = enableDynamicDuration
  if (disableMusicTrack !== undefined) input.disable_music_track = disableMusicTrack
  if (enableSpeechEnhancement !== undefined) input.enable_speech_enhancement = enableSpeechEnhancement
  if (startTime !== undefined) input.start_time = startTime
  if (endTime !== undefined) input.end_time = endTime

  const result = await fal.subscribe(DEFAULT_MODEL, {
    input,
    logs: true,
    onQueueUpdate: (update: unknown) => {
      const status =
        typeof update === 'object' &&
        update !== null &&
        'status' in update &&
        typeof update.status === 'string'
          ? mapQueueStatus(update.status)
          : null
      if (status) {
        onProgress?.(status.progress, status.label)
      }
    },
  })

  const parsed = FalLipSyncResult.parse(result.data)
  const outputUrl = parsed.video?.url ?? parsed.video_url
  if (!outputUrl) {
    throw new Error('No video was returned from the lip-sync model')
  }

  if (!workspaceId || !userId) {
    return outputUrl
  }

  onProgress?.(90, 'Saving to library')
  const downloaded = await downloadRemoteVideo(outputUrl)
  return uploadGeneratedVideo({
    workspaceId,
    userId,
    bytes: downloaded.bytes,
    mediaType: downloaded.mediaType,
  })
}
