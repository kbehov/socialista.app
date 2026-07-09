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

const RELATIVE_TIME_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

export function formatRelativeTime(date: Date | string | number): string {
  const target = new Date(date)
  const diffSeconds = Math.round((target.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  let duration = diffSeconds
  for (const { amount, unit } of RELATIVE_TIME_DIVISIONS) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit)
    }
    duration /= amount
  }

  return formatter.format(0, 'second')
}
