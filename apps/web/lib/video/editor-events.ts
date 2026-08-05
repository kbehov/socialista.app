/** Custom events for cross-panel video editor UX (open media rail, browse files, shortcuts). */

export const VIDEO_OPEN_MEDIA_EVENT = 'video-editor:open-media'
export const VIDEO_BROWSE_FILES_EVENT = 'video-editor:browse-files'
export const VIDEO_OPEN_SHORTCUTS_EVENT = 'video-editor:open-shortcuts'
export const VIDEO_FOCUS_URL_IMPORT_EVENT = 'video-editor:focus-url-import'
export const VIDEO_FOCUS_FORMAT_EVENT = 'video-editor:focus-format'

export function dispatchVideoEditorEvent(name: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(name))
}

export function openVideoMediaPanel(): void {
  dispatchVideoEditorEvent(VIDEO_OPEN_MEDIA_EVENT)
}

export function browseVideoFiles(): void {
  dispatchVideoEditorEvent(VIDEO_OPEN_MEDIA_EVENT)
  // Defer so the panel can open before focusing the file picker
  requestAnimationFrame(() => {
    dispatchVideoEditorEvent(VIDEO_BROWSE_FILES_EVENT)
  })
}

export function openVideoShortcutsHelp(): void {
  dispatchVideoEditorEvent(VIDEO_OPEN_SHORTCUTS_EVENT)
}

export function focusVideoUrlImport(): void {
  dispatchVideoEditorEvent(VIDEO_OPEN_MEDIA_EVENT)
  requestAnimationFrame(() => {
    dispatchVideoEditorEvent(VIDEO_FOCUS_URL_IMPORT_EVENT)
  })
}

export function focusVideoFormatSelector(): void {
  dispatchVideoEditorEvent(VIDEO_FOCUS_FORMAT_EVENT)
}
