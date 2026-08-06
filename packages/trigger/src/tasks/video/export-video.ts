import { connectDb, disconnectDb, getVideoById } from '@socialista/db'
import type { VideoExportOutput } from '@socialista/types'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'
import { videoExportPayloadSchema } from '../../schemas/video-export.schema.js'
import { exportProject } from '../../services/video-export/export-project.js'
import { uploadExportedVideo } from '../../services/video-upload.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'

export const exportVideo = schemaTask({
  id: TASK_IDS.videoExport,
  schema: videoExportPayloadSchema,
  maxDuration: 900,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<VideoExportOutput> => {
    try {
      await connectDb()

      const video = await getVideoById(payload.videoId)
      if (!video) {
        throw new Error('Video not found')
      }
      if (video.workspace.toString() !== payload.workspaceId) {
        throw new Error('Video does not belong to this workspace')
      }

      setGenerationStatus(5, 'Downloading media')

      const mp4 = await exportProject({
        video,
        settings: payload.settings,
        onProgress: (progress, phase) => {
          // progress is 0–1 from exportProject; map to 5–90 for metadata
          const pct = Math.round(5 + progress * 85)
          setGenerationStatus(Math.min(90, pct), phase)
        },
      })

      setGenerationStatus(95, 'Uploading')
      const videoUrl = await uploadExportedVideo({
        workspaceId: payload.workspaceId,
        videoId: payload.videoId,
        runId: ctx.run.id,
        bytes: mp4,
      })

      setGenerationStatus(100, 'Complete')
      logger.info('Video export complete', { videoId: payload.videoId, videoUrl, bytes: mp4.length })

      return { videoUrl }
    } catch (error) {
      setGenerationFailure(error, 'Video export failed')
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type ExportVideoTask = typeof exportVideo
