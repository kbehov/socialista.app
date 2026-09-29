export type PendingVideoLibraryImport = {
  id: string
  url: string
  name?: string
  width?: number
  height?: number
}

const STORAGE_KEY = 'socialista:pending-video-library-import'

export function stashVideoLibraryImport(data: PendingVideoLibraryImport): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Private mode or quota — editor opens without auto-import.
  }
}

export function consumeVideoLibraryImport(): PendingVideoLibraryImport | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(STORAGE_KEY)
    return JSON.parse(raw) as PendingVideoLibraryImport
  } catch {
    return null
  }
}
