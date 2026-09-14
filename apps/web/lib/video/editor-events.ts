/** Custom events for cross-panel video editor UX (open media rail, browse files, shortcuts). */

export type VideoStudioPanelTab = 'media' | 'text' | 'audio' | 'script' | 'captions'

export const VIDEO_OPEN_MEDIA_EVENT = 'video-editor:open-media'
export const VIDEO_BROWSE_FILES_EVENT = 'video-editor:browse-files'
export const VIDEO_OPEN_SHORTCUTS_EVENT = 'video-editor:open-shortcuts'
export const VIDEO_FOCUS_URL_IMPORT_EVENT = 'video-editor:focus-url-import'
export const VIDEO_FOCUS_FORMAT_EVENT = 'video-editor:focus-format'
export const VIDEO_PRESET_AUDIO_SCRIPT_EVENT = 'video-editor:preset-audio-script'

let pendingAudioScript: string | null = null

export function readPendingAudioScript(): string | null {
  return pendingAudioScript
}

export function clearPendingAudioScript(): void {
  pendingAudioScript = null
}

export function dispatchVideoEditorEvent(name: string, detail?: unknown): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function openVideoStudioPanel(tab: VideoStudioPanelTab = 'media'): void {
  dispatchVideoEditorEvent(VIDEO_OPEN_MEDIA_EVENT, tab)
}

export function openVideoMediaPanel(): void {
  openVideoStudioPanel('media')
}

export function openVideoAudioPanelWithScript(text: string): void {
  const next = text.trim()
  if (!next) return
  pendingAudioScript = next
  openVideoStudioPanel('audio')
  requestAnimationFrame(() => {
    dispatchVideoEditorEvent(VIDEO_PRESET_AUDIO_SCRIPT_EVENT, next)
  })
}

export function browseVideoFiles(): void {
  openVideoStudioPanel('media')
  const isMobileViewport =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
  if (isMobileViewport) return
  // Defer so the panel can open before focusing the file picker
  requestAnimationFrame(() => {
    dispatchVideoEditorEvent(VIDEO_BROWSE_FILES_EVENT)
  })
}

export function openVideoShortcutsHelp(): void {
  dispatchVideoEditorEvent(VIDEO_OPEN_SHORTCUTS_EVENT)
}

export function focusVideoUrlImport(): void {
  openVideoStudioPanel('media')
  const isMobileViewport =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
  if (isMobileViewport) return
  requestAnimationFrame(() => {
    dispatchVideoEditorEvent(VIDEO_FOCUS_URL_IMPORT_EVENT)
  })
}

export function focusVideoFormatSelector(): void {
  dispatchVideoEditorEvent(VIDEO_FOCUS_FORMAT_EVENT)
}
