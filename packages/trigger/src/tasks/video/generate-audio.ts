import { generateTextToSpeech } from '@socialista/ai'
import { connectDb, disconnectDb, getVideoById } from '@socialista/db'
import {
  estimateUgcSpokenDurationSec,
  TASK_IDS,
  type GenerateAudioOutput,
} from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { generateAudioPayloadSchema } from '../../schemas/generate-audio.schema.js'
import { uploadVideoAudio } from '../../services/audio-upload.js'
import { probeMediaDurationSec } from '../../services/video-export/ffmpeg.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import {
  assertSufficientCredits,
  finalizeGeneration,
  loadModelAndWorkspace,
} from '../shared/workspace.js'

async function measureAudioDurationSec(bytes: Uint8Array, fallbackSec: number): Promise<number> {
  const workDir = await mkdtemp(join(tmpdir(), 'video-audio-probe-'))
  try {
    const audioPath = join(workDir, 'audio.mp3')
    await writeFile(audioPath, bytes)
    const probed = await probeMediaDurationSec(audioPath)
    if (probed) return Math.round(probed * 10) / 10
    return fallbackSec
  } catch (error) {
    logger.warn('Could not probe voiceover duration, using estimate', { error })
    return fallbackSec
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

export const generateAudio = schemaTask({
  id: TASK_IDS.generateAudio,
  schema: generateAudioPayloadSchema,
  maxDuration: 120,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<GenerateAudioOutput> => {
    let started: { startedAt: Date } | undefined

    try {
      await connectDb()

      const video = await getVideoById(payload.videoId)
      if (!video) throw new Error('Video not found')

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost)

      const text = payload.text.trim()
      const voiceId = payload.voice.voiceId
      const speed = payload.voice.speed ?? 1

      started = await startGenerationRecord({
        kind: GenerationKind.VIDEO,
        taskId: TASK_IDS.generateAudio,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        projectId: video.project?.toString(),
        prompt: text,
        model,
        inputs: {
          videoId: payload.videoId,
          voice: payload.voice,
          durationSec: estimateUgcSpokenDurationSec(text, speed),
        },
      })

      setGenerationStatus(20, 'Generating voiceover')

      const audio = await generateTextToSpeech({
        text,
        voice: voiceId,
        speed: payload.voice.speed,
        stability: payload.voice.stability,
        similarity: payload.voice.similarity,
        style: payload.voice.style,
        speakerBoost: payload.voice.speakerBoost,
      })

      setGenerationStatus(70, 'Saving voiceover')

      const audioUrl = await uploadVideoAudio({
        workspaceId: payload.workspaceId,
        videoId: payload.videoId,
        runId: ctx.run.id,
        bytes: audio,
      })

      const durationSec = await measureAudioDurationSec(
        audio,
        estimateUgcSpokenDurationSec(text, speed),
      )

      await finalizeGeneration(payload.workspaceId, model)
      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: {
          type: GenerationResultType.FILE,
          url: audioUrl,
          durationSec,
          mimeType: 'audio/mpeg',
        },
        cost: model.cost,
        startedAt: started.startedAt,
      })

      setGenerationStatus(100, 'Voiceover ready')
      return { audioUrl, durationSec }
    } catch (error) {
      if (started) {
        await failGenerationRecord({
          triggerRunId: ctx.run.id,
          error,
          startedAt: started.startedAt,
        }).catch(() => undefined)
      }
      setGenerationFailure(error, 'Voiceover generation failed')
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})
