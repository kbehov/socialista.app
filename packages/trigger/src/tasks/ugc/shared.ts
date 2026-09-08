import {
  UgcClipStatus,
  UgcProjectStatus,
  type IUgcClip,
  type IUgcProject,
} from '@socialista/db'
import { writeFile } from 'node:fs/promises'

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

export function ugcAspectDimensions(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1080, height: 1080 }
    case '16:9':
      return { width: 1920, height: 1080 }
    default:
      return { width: 1080, height: 1920 }
  }
}

export function buildUgcNormalizeFfmpegArgs(
  sourcePath: string,
  normalizedPath: string,
  width: number,
  height: number,
  hasAudio: boolean,
): string[] {
  const scale = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fps=30`
  if (hasAudio) {
    return [
      '-y',
      '-i',
      sourcePath,
      '-vf',
      scale,
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
    ]
  }
  return [
    '-y',
    '-i',
    sourcePath,
    '-f',
    'lavfi',
    '-i',
    'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-vf',
    scale,
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
    '-shortest',
    normalizedPath,
  ]
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
