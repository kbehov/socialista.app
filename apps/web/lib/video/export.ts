import { fetchFile, ffmpeg, loadFFmpeg, onFFmpegProgress } from './ffmpeg'
import { buildFilterGraph, type ClipInput } from './build-filter-complex'
import { renderOverlayPngs } from './export-text-png'
import { isMediaAssetAvailable, type MediaAsset } from './types'
import type { ExportSettings, Project, SerializedMediaAsset } from '@socialista/types'

export type AssetMap = Record<string, MediaAsset | SerializedMediaAsset>
export type ExportProgress = (progress: number, phase: string) => void

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

/**
 * Run the full export pipeline. Resolves to a Blob (video/mp4).
 *
 * The caller is responsible for updating store export progress; this function
 * also reports via the optional progress callback.
 */
export async function exportProject(
  project: Project,
  assets: AssetMap,
  settings: ExportSettings,
  onProgress?: ExportProgress,
): Promise<Blob> {
  onProgress?.(0, 'Loading FFmpeg')
    await loadFFmpeg()
    // Mount input files
    const clipInputs: ClipInput[] = []
    let inputIndex = 0
    const seenAssetIds = new Set<string>()
    for (const track of project.tracks) {
      for (const clipId of track.clips) {
        const clip = project.clips[clipId]
        if (!clip) continue
        const asset = assets[clip.assetId]
        if (!asset || !isMediaAssetAvailable(asset)) {
          throw new Error(`Missing media for clip ${clip.id}; re-import the file to export.`)
        }
        if (!seenAssetIds.has(asset.id)) {
          const fsPath = `/input_${asset.id}.bin`
          const data = await fetchFile(asset.file)
          await ffmpeg.writeFile(fsPath, data as Uint8Array)
          seenAssetIds.add(asset.id)
        }
        const fsPath = `/input_${asset.id}.bin`
        const isImage = clip.type === 'image'
        clipInputs.push({ clip, inputIndex, fsPath, isImage })
        inputIndex += 1
      }
    }

    // Pre-render text overlays to PNGs
    onProgress?.(0.05, 'Rendering text overlays')
    const overlayPngs = await renderOverlayPngs(
      ffmpeg as unknown as { writeFile: (path: string, data: Uint8Array) => Promise<void> },
      project.textOverlays,
      settings.resolution,
    )

  // Build filter graph
  onProgress?.(0.1, 'Building filter graph')
  const graph = buildFilterGraph(project, clipInputs, overlayPngs)

  // Reset ffmpeg FS state — we'll write a fresh input set
  let unsubscribe: (() => void) | null = null
  if (onProgress) {
    // Map overall progress between 0.1 (start) and 0.95 (encode end)
    unsubscribe = onFFmpegProgress(p => onProgress(0.1 + p * 0.85, 'Encoding'))
  }

  const args: string[] = []
  args.push(...graph.inputArgs)
  args.push('-filter_complex', graph.filterComplex)
  args.push(...graph.mapArgs)
  args.push(
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
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    '-y',
    '/output.mp4',
  )

  try {
    await ffmpeg.exec(args)
  } finally {
    if (unsubscribe) unsubscribe()
  }

  onProgress?.(0.97, 'Finalizing')
  const data = await ffmpeg.readFile('/output.mp4')
  try {
    await ffmpeg.deleteFile('/output.mp4')
  } catch {
    // Ignore
  }
  onProgress?.(1, 'Done')
  const bytes = (data as unknown as Uint8Array).slice()
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'video/mp4' })
}
