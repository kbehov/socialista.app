const MB = 1024 * 1024
const GB = MB * 1024

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 B'

  const k = 1024
  const dm = Math.max(0, decimals)
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const value = bytes / k ** i

  return `${Number.parseFloat(value.toFixed(dm))} ${sizes[i]}`
}

export function formatFileCount(count: number): string {
  if (count === 1) return '1 file'
  return `${count} files`
}

export function formatItemCount(count: number): string {
  if (count === 1) return '1 item'
  return `${count} items`
}

/** Formats storage as MB or GB only (no B/KB). */
export function formatStorageSize(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 MB'

  const dm = Math.max(0, decimals)

  if (bytes >= GB) {
    return `${Number.parseFloat((bytes / GB).toFixed(dm))} GB`
  }

  return `${Number.parseFloat((bytes / MB).toFixed(dm))} MB`
}
