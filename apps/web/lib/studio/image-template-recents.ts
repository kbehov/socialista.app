import {
  StudioTemplateKind,
  type StudioTemplateDto,
  type StudioTemplateImagePayload,
} from '@socialista/types'

export const IMAGE_TEMPLATE_RECENTS_KEY = 'studio:image-recents:v1'
const MAX_RECENTS = 6

export type ImageTemplateRecentRecord = {
  id: string
  name?: string
  previewImageUrl: string
  categories: string[]
  payload: StudioTemplateImagePayload
}

function isRecentRecord(value: unknown): value is ImageTemplateRecentRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<ImageTemplateRecentRecord>
  return (
    typeof record.id === 'string' &&
    typeof record.previewImageUrl === 'string' &&
    Array.isArray(record.categories) &&
    record.payload !== null &&
    typeof record.payload === 'object'
  )
}

export function readImageTemplateRecents(): ImageTemplateRecentRecord[] {
  try {
    const raw = localStorage.getItem(IMAGE_TEMPLATE_RECENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecentRecord).slice(0, MAX_RECENTS)
  } catch {
    return []
  }
}

export function rememberImageTemplateRecent(template: StudioTemplateDto) {
  if (template.kind !== StudioTemplateKind.IMAGE) return
  if (typeof window === 'undefined') return

  const next: ImageTemplateRecentRecord = {
    id: template._id,
    name: template.name,
    previewImageUrl: template.previewImageUrl,
    categories: template.categories,
    payload: template.payload,
  }

  try {
    const without = readImageTemplateRecents().filter(item => item.id !== next.id)
    localStorage.setItem(IMAGE_TEMPLATE_RECENTS_KEY, JSON.stringify([next, ...without].slice(0, MAX_RECENTS)))
    window.dispatchEvent(new Event('studio-image-recents'))
  } catch {
    // Private mode, quota, or disabled storage.
  }
}

export function recentRecordToTemplate(record: ImageTemplateRecentRecord): StudioTemplateDto {
  return {
    _id: record.id,
    kind: StudioTemplateKind.IMAGE,
    name: record.name,
    previewImageUrl: record.previewImageUrl,
    categories: record.categories,
    payload: record.payload,
    createdAt: new Date(0),
  }
}
