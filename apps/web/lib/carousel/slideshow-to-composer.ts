import { uploadPostMedia } from '@/actions/post.actions'
import { renderSlidesToFiles } from '@/lib/carousel/export'
import { persistSlideExternalImages } from '@/lib/carousel/persist-slide-images'
import type { ComposerMediaItem } from '@/types/composer-types'
import type { SlideshowResponse } from '@socialista/types'

export type SlideshowComposerImportPhase = 'persisting' | 'rendering' | 'uploading'

export type SlideshowComposerImportProgress = {
  phase: SlideshowComposerImportPhase
  current: number
  total: number
}

type ImportSlideshowToComposerOptions = {
  onProgress?: (progress: SlideshowComposerImportProgress) => void
}

/** Render slideshow slides to PNGs and upload them as composer image media. */
export async function importSlideshowToComposer(
  workspaceId: string,
  slideshow: SlideshowResponse,
  { onProgress }: ImportSlideshowToComposerOptions = {},
): Promise<ComposerMediaItem[]> {
  const sortedSlides = [...slideshow.slides].sort((a, b) => a.order - b.order)
  if (sortedSlides.length === 0) {
    throw new Error('Slideshow has no slides')
  }

  // Upload external/proxied images (TikTok CDN, Unsplash, etc.) to R2 first so
  // render does not depend on ephemeral CDNs or nested image-proxy URLs.
  const slides = await persistSlideExternalImages(workspaceId, sortedSlides, {
    onProgress: progress => onProgress?.({ phase: 'persisting', ...progress }),
  })

  const files = await renderSlidesToFiles(slides, slideshow.canvas.width, {
    onProgress: (current, total) => onProgress?.({ phase: 'rendering', current, total }),
  })
  if (files.length === 0) {
    throw new Error('Failed to render slideshow slides')
  }

  const items: ComposerMediaItem[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadPostMedia(workspaceId, formData)
    if (!result.success || !result.file) {
      throw new Error(result.message ?? `Failed to upload slide ${i + 1}`)
    }

    items.push({
      kind: 'image',
      url: result.file.url,
    })
    onProgress?.({ phase: 'uploading', current: i + 1, total: files.length })
  }

  return items
}
