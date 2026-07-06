import { renderSlidesToFiles } from '@/lib/carousel/export'
import { importMediaAsset } from '@/lib/video/media-import'
import { useVideoEditorStore } from '@/lib/video/store'
import type { SlideshowResponse } from '@socialista/types'

export const SLIDESHOW_CLIP_DURATION_SECONDS = 3

export type SlideshowImportPhase = 'rendering' | 'importing'

export type SlideshowImportProgress = {
  phase: SlideshowImportPhase
  current: number
  total: number
}

type ImportSlideshowOptions = {
  onProgress?: (progress: SlideshowImportProgress) => void
}

export async function importSlideshowToTimeline(
  slideshow: SlideshowResponse,
  { onProgress }: ImportSlideshowOptions = {},
): Promise<number> {
  const sortedSlides = [...slideshow.slides].sort((a, b) => a.order - b.order)
  if (sortedSlides.length === 0) {
    throw new Error('Slideshow has no slides')
  }

  const files = await renderSlidesToFiles(sortedSlides, slideshow.canvas.width, {
    onProgress: (current, total) => onProgress?.({ phase: 'rendering', current, total }),
  })
  if (files.length === 0) {
    throw new Error('Failed to render slideshow slides')
  }

  const store = useVideoEditorStore.getState()
  store.setResolution(slideshow.canvas)
  store.setProjectName(slideshow.name)

  const videoTrack = store.project.tracks.find(track => track.type === 'video')
  if (!videoTrack) {
    throw new Error('No video track available')
  }

  let imported = 0
  const assets = await Promise.all(
    files.map(async file => {
      const asset = await importMediaAsset(file)
      imported += 1
      onProgress?.({ phase: 'importing', current: imported, total: files.length })
      return asset
    }),
  )

  let startTime = 0
  let clipCount = 0

  for (const asset of assets) {
    store.registerAsset(asset)
    const clipId = store.addClip(asset.id, videoTrack.id, startTime, SLIDESHOW_CLIP_DURATION_SECONDS)
    if (!clipId) {
      throw new Error('Failed to add slide to timeline')
    }
    startTime += SLIDESHOW_CLIP_DURATION_SECONDS
    clipCount++
  }

  return clipCount
}
