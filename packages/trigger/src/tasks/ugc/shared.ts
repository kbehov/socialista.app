import {
  UgcClipStatus,
  UgcProjectStatus,
  type IUgcClip,
  type IUgcProject,
} from '@socialista/db'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { runFfmpeg } from '../../services/video-export/ffmpeg.js'
import { uploadExportedVideo } from '../../services/video-upload.js'

export function findUgcClip(project: IUgcProject, clipId: string): IUgcClip | undefined {
  return (project.clips ?? []).find(clip => clip.id === clipId)
}

export function resolveUgcInfluencerId(project: IUgcProject, clip: IUgcClip): string | undefined {
  return clip.influencerId?.toString() ?? project.influencerId?.toString()
}

export function projectStatusFromClips(clips: IUgcClip[]): UgcProjectStatus {
  if (clips.some(clip => clip.status === UgcClipStatus.GENERATING)) return UgcProjectStatus.GENERATING
  if (clips.some(clip => clip.status === UgcClipStatus.READY)) return UgcProjectStatus.READY
  if (clips.every(clip => clip.status === UgcClipStatus.FAILED) && clips.length > 0) {
    return UgcProjectStatus.FAILED
  }
  return UgcProjectStatus.DRAFT
}

export async function downloadToFile(url: string, dest: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download clip (${response.status})`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  await writeFile(dest, bytes)
}

export function buildUgcVoiceoverFfmpegArgs(
  videoPath: string,
  audioPath: string,
  outPath: string,
): string[] {
  return [
    '-y',
    '-i',
    videoPath,
    '-i',
    audioPath,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-ar',
    '48000',
    '-ac',
    '2',
    '-shortest',
    outPath,
  ]
}

export async function muxUgcVoiceover(input: {
  videoUrl: string
  audioUrl: string
  workspaceId: string
  clipId: string
  runId: string
  durationSec?: number
}): Promise<string> {
  const workDir = await mkdtemp(join(tmpdir(), 'ugc-mux-'))
  try {
    const videoPath = join(workDir, 'video.mp4')
    const audioPath = join(workDir, 'audio.mp3')
    const outPath = join(workDir, 'muxed.mp4')
    await Promise.all([
      downloadToFile(input.videoUrl, videoPath),
      downloadToFile(input.audioUrl, audioPath),
    ])
    await runFfmpeg({
      args: buildUgcVoiceoverFfmpegArgs(videoPath, audioPath, outPath),
      durationSeconds: input.durationSec ?? 8,
    })
    const bytes = await readFile(outPath)
    return uploadExportedVideo({
      workspaceId: input.workspaceId,
      videoId: input.clipId,
      runId: input.runId,
      bytes,
    })
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

export function fallbackUgcVideoPrompt(input: {
  durationSec: number
  script?: string
  directions?: string
  plannedPrompt?: string
}) {
  if (input.plannedPrompt) return input.plannedPrompt
  if (input.script || input.directions) {
    return `Photoreal UGC video, same subject as the start frame. Natural handheld motion. Duration ${input.durationSec}s. ${input.script ? `Spoken energy: ${input.script}.` : ''} ${input.directions ?? ''} No on-screen text, no watermark.`
  }
  return `Photoreal UGC video starting from this frame. Keep the same person, clothes, room, and product. Natural phone-camera motion for ${input.durationSec} seconds. ${input.script ? `Spoken energy: ${input.script}.` : 'No talking — product or scene motion only.'} ${input.directions ?? ''} No captions or logos.`
}
