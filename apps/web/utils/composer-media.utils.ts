import { uploadPostMedia } from '@/actions/post.actions'
import type { WorkspaceMediaPick } from '@/components/media/workspace-media-picker-dialog'
import type { ComposerMediaItem } from '@/types/composer-types'
import type { Generation } from '@socialista/types'
import { toast } from 'sonner'

export function isComposerVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

export function isComposerImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function isComposerMediaFile(file: File): boolean {
  return isComposerImageFile(file) || isComposerVideoFile(file)
}

export async function readVideoDuration(file: File): Promise<number | undefined> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : undefined
      URL.revokeObjectURL(url)
      resolve(duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(undefined)
    }
    video.src = url
  })
}

export async function readVideoDurationFromUrl(url: string): Promise<number | undefined> {
  return new Promise(resolve => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : undefined
      resolve(duration)
    }
    video.onerror = () => resolve(undefined)
    video.src = url
  })
}

export function workspacePickToComposerItem(
  item: WorkspaceMediaPick,
  durationSeconds?: number,
): ComposerMediaItem {
  if (item.kind === 'video') {
    return {
      kind: 'video',
      url: item.url,
      durationSeconds,
    }
  }
  return {
    kind: 'image',
    url: item.url,
  }
}

/** Map a completed generation result into composer media items. */
export function generationToComposerMedia(generation: Generation): ComposerMediaItem[] {
  const result = generation.result
  if (generation.status !== 'completed' || !result?.url) return []

  if (result.type === 'video') {
    return [
      {
        kind: 'video',
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        durationSeconds: result.durationSec,
      },
    ]
  }

  const urls = result.urls && result.urls.length > 0 ? result.urls : [result.url]
  return urls.map(url => ({
    kind: 'image' as const,
    url,
    thumbnailUrl: result.thumbnailUrl,
  }))
}

/** Upload device files into the composer media list (includes video duration). */
export async function uploadComposerMediaFiles(
  workspaceId: string,
  files: FileList | File[],
  onUploaded: (item: ComposerMediaItem) => void,
): Promise<void> {
  const list = Array.from(files).filter(isComposerMediaFile)
  if (list.length === 0) {
    toast.error('Only images and videos are supported')
    return
  }

  for (const file of list) {
    const formData = new FormData()
    formData.append('file', file)

    const durationSeconds = isComposerVideoFile(file) ? await readVideoDuration(file) : undefined
    const result = await uploadPostMedia(workspaceId, formData)

    if (!result.success || !result.file) {
      toast.error(result.message ?? `Failed to upload ${file.name}`)
      continue
    }

    if (isComposerVideoFile(file)) {
      onUploaded({
        kind: 'video',
        url: result.file.url,
        durationSeconds,
      })
    } else {
      onUploaded({
        kind: 'image',
        url: result.file.url,
      })
    }
  }
}

export async function composerItemsFromLibraryPicks(
  items: WorkspaceMediaPick[],
  onUploaded: (item: ComposerMediaItem) => void,
): Promise<void> {
  for (const item of items) {
    if (item.kind === 'video') {
      const durationSeconds = await readVideoDurationFromUrl(item.url)
      onUploaded(workspacePickToComposerItem(item, durationSeconds))
      continue
    }
    onUploaded(workspacePickToComposerItem(item))
  }
}
