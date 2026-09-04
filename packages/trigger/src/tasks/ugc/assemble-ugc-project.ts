import {
  connectDb,
  disconnectDb,
  getUgcProjectById,
  updateUgcProject,
  UgcProjectStatus,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { assembleUgcProjectPayloadSchema } from '../../schemas/assemble-ugc-project.schema.js'
import { runFfmpeg } from '../../services/video-export/ffmpeg.js'
import { uploadExportedVideo } from '../../services/video-upload.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { loadModelAndWorkspace } from '../shared/workspace.js'

async function downloadToFile(url: string, dest: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download clip (${response.status})`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  await writeFile(dest, bytes)
}

export const assembleUgcProject = schemaTask({
  id: TASK_IDS.assembleUgcProject,
  schema: assembleUgcProjectPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    const workDir = await mkdtemp(join(tmpdir(), 'ugc-assemble-'))
    let startedAt: Date | undefined

    try {
      await connectDb()
      const project = await getUgcProjectById(payload.projectId)
      if (!project) throw new Error('UGC project not found')

      const readyClips = (project.clips ?? []).filter(clip => Boolean(clip.videoUrl))
      if (readyClips.length < 1) {
        throw new Error('Generate at least one scene video first')
      }

      const videoModelValue = project.models.video
      const { model } = await loadModelAndWorkspace(videoModelValue, payload.workspaceId)

      await updateUgcProject(payload.projectId, {
        status: UgcProjectStatus.GENERATING,
        assembledRunId: ctx.run.id,
        error: undefined,
      })

      const started = await startGenerationRecord({
        kind: GenerationKind.VIDEO,
        taskId: TASK_IDS.assembleUgcProject,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        projectId: project.project?.toString(),
        prompt: `Assemble ${readyClips.length} UGC clips`,
        model,
        inputs: {
          ugcProjectId: payload.projectId,
          durationSec: readyClips.reduce((sum, clip) => sum + (clip.durationSec ?? 8), 0),
        },
      })
      startedAt = started.startedAt

      setGenerationStatus(10, 'Downloading clips')

      const normalized: string[] = []
      for (let index = 0; index < readyClips.length; index++) {
        const clip = readyClips[index]
        if (!clip?.videoUrl) continue
        const sourcePath = join(workDir, `src-${index}.mp4`)
        const normalizedPath = join(workDir, `norm-${index}.mp4`)
        await downloadToFile(clip.videoUrl, sourcePath)
        setGenerationStatus(15 + Math.round((index / readyClips.length) * 40), `Normalizing clip ${index + 1}`)
        await runFfmpeg({
          args: [
            '-y',
            '-i',
            sourcePath,
            '-vf',
            'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30',
            '-c:v',
            'libx264',
            '-preset',
            'veryfast',
            '-crf',
            '20',
            '-c:a',
            'aac',
            '-ar',
            '48000',
            '-ac',
            '2',
            normalizedPath,
          ],
          durationSeconds: clip.durationSec ?? 8,
        })
        normalized.push(normalizedPath)
      }

      const listPath = join(workDir, 'concat.txt')
      await writeFile(
        listPath,
        normalized.map(path => `file '${path.replace(/'/g, "'\\''")}'`).join('\n'),
      )

      setGenerationStatus(70, 'Stitching clips')
      const outputPath = join(workDir, 'assembled.mp4')
      const totalDuration = readyClips.reduce((sum, clip) => sum + (clip.durationSec ?? 8), 0)
      await runFfmpeg({
        args: ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outputPath],
        durationSeconds: totalDuration,
      })

      setGenerationStatus(88, 'Uploading assembled ad')
      const bytes = await readFile(outputPath)
      const assembledVideoUrl = await uploadExportedVideo({
        workspaceId: payload.workspaceId,
        videoId: payload.projectId,
        runId: ctx.run.id,
        bytes,
      })

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: { type: GenerationResultType.VIDEO, url: assembledVideoUrl },
        cost: 0,
        startedAt: started.startedAt,
      })

      await updateUgcProject(payload.projectId, {
        assembledVideoUrl,
        assembledGenerationId: started.generationId,
        status: UgcProjectStatus.READY,
        error: undefined,
      })

      setGenerationStatus(100, 'Assembled ad ready')
      logger.info('UGC project assembled', { projectId: payload.projectId, clips: readyClips.length })
      return { projectId: payload.projectId, assembledVideoUrl }
    } catch (error) {
      setGenerationFailure(error, 'Could not assemble clips')
      if (startedAt) {
        await failGenerationRecord({
          triggerRunId: ctx.run.id,
          error,
          startedAt,
        })
      }
      await updateUgcProject(payload.projectId, {
        status: UgcProjectStatus.FAILED,
        error: error instanceof Error ? error.message : 'Could not assemble clips',
      }).catch(() => undefined)
      throw error
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
      await disconnectDb()
    }
  },
})
