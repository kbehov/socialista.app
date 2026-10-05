import {
  StudioTemplateKind,
  type StudioTemplateDto,
  type StudioTemplateVideoPayload,
} from '@socialista/types'

export const VIDEO_TEMPLATE_RECENTS_KEY = 'studio:video-recents:v1'
const MAX_RECENTS = 6

export type VideoTemplateRecentRecord = {
  id: string
  name?: string
  previewImageUrl: string
  categories: string[]
  payload: StudioTemplateVideoPayload
}

function isRecentRecord(value: unknown): value is VideoTemplateRecentRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<VideoTemplateRecentRecord>
  return (
    typeof record.id === 'string' &&
    typeof record.previewImageUrl === 'string' &&
    Array.isArray(record.categories) &&
    record.payload !== null &&
    typeof record.payload === 'object'
  )
}

export function readVideoTemplateRecents(): VideoTemplateRecentRecord[] {
  try {
    const raw = localStorage.getItem(VIDEO_TEMPLATE_RECENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecentRecord).slice(0, MAX_RECENTS)
  } catch {
    return []
  }
}

export function rememberVideoTemplateRecent(template: StudioTemplateDto) {
  if (template.kind !== StudioTemplateKind.VIDEO) return
  if (typeof window === 'undefined') return

  const next: VideoTemplateRecentRecord = {
    id: template._id,
    name: template.name,
    previewImageUrl: template.previewImageUrl,
    categories: template.categories,
    payload: template.payload,
  }

  try {
    const without = readVideoTemplateRecents().filter(item => item.id !== next.id)
    localStorage.setItem(
      VIDEO_TEMPLATE_RECENTS_KEY,
      JSON.stringify([next, ...without].slice(0, MAX_RECENTS)),
    )
    window.dispatchEvent(new Event('studio-video-recents'))
  } catch {
    // Private mode, quota, or disabled storage.
  }
}

export function recentRecordToTemplate(record: VideoTemplateRecentRecord): StudioTemplateDto {
  return {
    _id: record.id,
    kind: StudioTemplateKind.VIDEO,
    name: record.name,
    previewImageUrl: record.previewImageUrl,
    categories: record.categories,
    payload: record.payload,
    createdAt: new Date(0),
  }
}
