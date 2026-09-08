import type { AttachedMedia } from '@/components/files/attach-images-dialog'

export const STUDIO_IMAGE_DRAG_MIME = 'application/x-socialista-studio-image'
const STUDIO_IMAGE_DRAG_TEXT_PREFIX = 'socialista-studio-image:'

export type StudioImageDragPayload = {
  url: string
  label?: string
  source?: AttachedMedia['source']
}

export function setStudioImageDrag(dataTransfer: DataTransfer, payload: StudioImageDragPayload) {
  const json = JSON.stringify(payload)
  dataTransfer.setData(STUDIO_IMAGE_DRAG_MIME, json)
  dataTransfer.setData('text/plain', `${STUDIO_IMAGE_DRAG_TEXT_PREFIX}${json}`)
  dataTransfer.effectAllowed = 'copy'
}

export function isStudioImageDrag(types: readonly string[]) {
  return types.includes(STUDIO_IMAGE_DRAG_MIME)
}

export function readStudioImageDrag(dataTransfer: DataTransfer): StudioImageDragPayload | null {
  const raw =
    dataTransfer.getData(STUDIO_IMAGE_DRAG_MIME) || dataTransfer.getData('text/plain')
  if (!raw) return null
  const json = raw.startsWith(STUDIO_IMAGE_DRAG_TEXT_PREFIX)
    ? raw.slice(STUDIO_IMAGE_DRAG_TEXT_PREFIX.length)
    : raw
  try {
    const parsed = JSON.parse(json) as StudioImageDragPayload
    if (parsed && typeof parsed.url === 'string' && parsed.url.length > 0) return parsed
  } catch {
    return null
  }
  return null
}

export function attachedMediaFromStudioDrag(payload: StudioImageDragPayload): AttachedMedia {
  return {
    id: `drag-${payload.url}`,
    url: payload.url,
    kind: 'image',
    source: payload.source ?? 'library',
    label: payload.label ?? 'Reference',
    name: payload.label ?? 'Reference',
  }
}
