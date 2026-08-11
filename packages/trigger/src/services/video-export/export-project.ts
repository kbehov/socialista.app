import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type {
  Clip,
  ClipId,
  ExportSettings,
  Project,
  SerializedMediaAsset,
  TextOverlay,
  Track,
} from '@socialista/types'
import type { IVideo } from '@socialista/db'
import { buildFilterGraph, type ClipInput } from './build-filter-complex.js'
import { probeHasAudioStream, runFfmpeg } from './ffmpeg.js'
import { renderOverlayPngs } from './render-text-overlays.js'

const QUALITY_CRF: Record<ExportSettings['quality'], number> = {
  low: 28,
  medium: 23,
  high: 18,
}

const QUALITY_PRESET: Record<ExportSettings['quality'], string> = {
  low: 'veryfast',
  medium: 'fast',
  high: 'medium',
}

export type ExportProjectProgress = (progress: number, phase: string) => void

export function videoDocToProject(video: IVideo, settings: ExportSettings): Project {
  const clips: Record<ClipId, Clip> = {}
  for (const clip of video.clips) {
    clips[clip.id] = clip as unknown as Clip
  }
  return {
    id: video._id.toString(),
    name: video.name,
    duration: video.duration,
    resolution: settings.resolution,
    fps: settings.fps,
    tracks: video.tracks as unknown as Track[],
    clips,
    textOverlays: video.textOverlays as unknown as TextOverlay[],
    assets: video.assets as unknown as SerializedMediaAsset[],
  }
}

async function downloadToFile(url: string, dest: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download media (${response.status}): ${url}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(dest, buffer)
}

function extensionForAsset(asset: SerializedMediaAsset): string {
  if (asset.url) {
    try {
      const pathname = new URL(asset.url).pathname
      const ext = pathname.split('.').pop()?.toLowerCase()
      if (ext && /^[a-z0-9]{2,5}$/.test(ext)) return ext
    } catch {
      // ignore invalid URLs
    }
  }
  if (asset.type === 'image') return 'png'
  if (asset.type === 'audio') return 'mp3'
  return 'mp4'
}

async function prepareClipInputs(
  project: Project,
  workDir: string,
): Promise<ClipInput[]> {
  const assetsById = new Map(project.assets.map(a => [a.id, a]))
  const downloaded = new Map<string, string>()
  const clipInputs: ClipInput[] = []
  let inputIndex = 0

  const downloads: Promise<void>[] = []

  for (const track of project.tracks) {
    for (const clipId of track.clips) {
      const clip = project.clips[clipId]
      if (!clip) continue
      const asset = assetsById.get(clip.assetId)
      if (!asset?.url) {
        throw new Error(`Missing media URL for clip ${clip.id}; save the video before exporting.`)
      }

      let fsPath = downloaded.get(asset.id)
      if (!fsPath) {
        const ext = extensionForAsset(asset)
        fsPath = path.join(workDir, `input_${asset.id}.${ext}`)
        downloaded.set(asset.id, fsPath)
        downloads.push(downloadToFile(asset.url, fsPath))
      }

      clipInputs.push({
        clip,
        inputIndex,
        fsPath,
        isImage: clip.type === 'image',
      })
      inputIndex += 1
    }
  }

  await Promise.all(downloads)

  const probed = new Map<string, boolean>()
  await Promise.all(
    [...downloaded.entries()].map(async ([assetId, fsPath]) => {
      probed.set(assetId, await probeHasAudioStream(fsPath))
    }),
  )

  for (const input of clipInputs) {
    const asset = assetsById.get(input.clip.assetId)
    if (!asset) continue
    if (input.isImage) {
      input.hasAudioStream = false
      continue
    }
    input.hasAudioStream = probed.get(asset.id) ?? false
  }

  return clipInputs
}

/**
 * Full server-side export pipeline. Returns MP4 bytes.
 */
export async function exportProject(options: {
  video: IVideo
  settings: ExportSettings
  onProgress?: ExportProjectProgress
}): Promise<Buffer> {
  const { video, settings, onProgress } = options
  const workDir = await mkdtemp(path.join(os.tmpdir(), 'socialista-export-'))
  const overlayDir = path.join(workDir, 'overlays')
  await mkdir(overlayDir, { recursive: true })

  try {
    const project = videoDocToProject(video, settings)

    onProgress?.(0.05, 'Downloading media')
    const clipInputs = await prepareClipInputs(project, workDir)

    onProgress?.(0.1, 'Rendering text overlays')
    const overlayPngs = await renderOverlayPngs(project.textOverlays, settings.resolution, overlayDir)

    onProgress?.(0.12, 'Building filter graph')
    const graph = buildFilterGraph(project, clipInputs, overlayPngs)

    if (!graph.mapArgs.length) {
      throw new Error('Nothing to export — add clips to the timeline first.')
    }

    const outputPath = path.join(workDir, 'output.mp4')
    const hasAudioMap = graph.mapArgs.some(
      (arg, i) => arg === '-map' && Boolean(graph.mapArgs[i + 1]?.startsWith('[a')),
    )

    const args: string[] = [
      ...graph.inputArgs,
      '-filter_complex',
      graph.filterComplex,
      ...graph.mapArgs,
      '-c:v',
      'libx264',
      '-preset',
      QUALITY_PRESET[settings.quality],
      '-crf',
      String(QUALITY_CRF[settings.quality]),
      '-pix_fmt',
      'yuv420p',
      '-r',
      String(settings.fps),
    ]

    if (hasAudioMap) {
      args.push('-c:a', 'aac', '-b:a', '128k')
    } else {
      args.push('-an')
    }

    args.push('-movflags', '+faststart', '-y', outputPath)

    await runFfmpeg({
      args,
      durationSeconds: Math.max(project.duration, 0.1),
      onProgress: p => onProgress?.(0.15 + p * 0.75, 'Encoding'),
    })

    onProgress?.(0.92, 'Finalizing')
    return await readFile(outputPath)
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
