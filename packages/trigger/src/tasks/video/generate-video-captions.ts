import { generateCaptions } from '@socialista/ai'
import { connectDb, deductAiCredits, disconnectDb, getVideoById } from '@socialista/db'
import type { GenerateVideoCaptionsOutput } from '@socialista/types'
import { TASK_IDS, VIDEO_CAPTIONS_CREDIT_COST } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { videoCaptionsPayloadSchema } from '../../schemas/video-captions.schema.js'
import { probeHasAudioStream, runFfmpeg } from '../../services/video-export/ffmpeg.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, loadWorkspace } from '../shared/workspace.js'

const WHISPER_MAX_BYTES = 25 * 1024 * 1024

function extensionFromUrl(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname
    const ext = pathname.split('.').pop()?.toLowerCase()
    if (ext && /^[a-z0-9]{2,5}$/.test(ext)) return ext
  } catch {
    // ignore invalid URLs
  }
  return fallback
}

async function downloadToFile(url: string, dest: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download media (${response.status})`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(dest, buffer)
}

async function extractClipAudioMp3(options: {
  inputPath: string
  outputPath: string
  trimIn: number
  durationSeconds: number
}): Promise<void> {
  const trimIn = Math.max(0, options.trimIn)
  const durationSeconds = Math.max(0.1, options.durationSeconds)
  await runFfmpeg({
    args: [
      '-y',
      '-i',
      options.inputPath,
      '-ss',
      trimIn.toFixed(3),
      '-t',
      durationSeconds.toFixed(3),
      '-vn',
      '-ac',
      '1',
      '-ar',
      '16000',
      '-c:a',
      'libmp3lame',
      '-q:a',
      '4',
      options.outputPath,
    ],
    durationSeconds,
  })
}

export const generateVideoCaptions = schemaTask({
  id: TASK_IDS.videoCaptions,
  schema: videoCaptionsPayloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload): Promise<GenerateVideoCaptionsOutput> => {
    const workDir = await mkdtemp(path.join(tmpdir(), 'socialista-captions-'))

    try {
      await connectDb()

      const workspace = await loadWorkspace(payload.workspaceId)
      assertSufficientCredits(workspace, VIDEO_CAPTIONS_CREDIT_COST)

      const video = await getVideoById(payload.videoId)
      if (!video) {
        throw new Error('Video not found')
      }
      if (video.workspace.toString() !== payload.workspaceId) {
        throw new Error('Video does not belong to this workspace')
      }

      const clip = video.clips.find(item => item.id === payload.clipId)
      if (!clip) {
        throw new Error('Clip not found')
      }
      if (clip.type === 'image') {
        throw new Error('Select a video or audio clip with speech')
      }

      const asset = video.assets.find(item => item.id === clip.assetId)
      if (!asset?.url) {
        throw new Error('Save your video before generating captions')
      }

      setGenerationStatus(10, 'Downloading media')
      const sourceExt = extensionFromUrl(asset.url, asset.type === 'audio' ? 'mp3' : 'mp4')
      const sourcePath = path.join(workDir, `source.${sourceExt}`)
      await downloadToFile(asset.url, sourcePath)

      setGenerationStatus(25, 'Checking audio')
      const hasAudio = await probeHasAudioStream(sourcePath)
      if (!hasAudio) {
        throw new Error('This clip has no audio to transcribe')
      }

      setGenerationStatus(40, 'Extracting audio')
      const audioPath = path.join(workDir, 'audio.mp3')
      await extractClipAudioMp3({
        inputPath: sourcePath,
        outputPath: audioPath,
        trimIn: clip.trimIn,
        durationSeconds: clip.duration,
      })
      const audio = new Uint8Array(await readFile(audioPath))
      if (audio.byteLength === 0) {
        throw new Error('Could not extract audio from this clip')
      }
      if (audio.byteLength > WHISPER_MAX_BYTES) {
        throw new Error('Audio is too large to transcribe. Try a shorter clip.')
      }

      setGenerationStatus(60, 'Transcribing')
      const result = await generateCaptions({ audio, durationSeconds: clip.duration })

      await deductAiCredits(payload.workspaceId, VIDEO_CAPTIONS_CREDIT_COST)

      setGenerationStatus(100, 'Complete')
      logger.info('Video captions generated', {
        videoId: payload.videoId,
        clipId: payload.clipId,
        segments: result.segments.length,
        language: result.language,
      })

      return {
        clipId: payload.clipId,
        language: result.language,
        segments: result.segments,
      }
    } catch (error) {
      setGenerationFailure(error, 'Caption generation failed')
      throw error as Error
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
      await disconnectDb()
    }
  },
})

export type GenerateVideoCaptionsTask = typeof generateVideoCaptions
