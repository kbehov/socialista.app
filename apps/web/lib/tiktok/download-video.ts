const TIKTOK_REFERER = 'https://www.tiktok.com/'
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

export async function downloadTikTokVideo(urls: string[]): Promise<Blob> {
  const candidates = [...new Set(urls.filter(Boolean))]
  if (candidates.length === 0) {
    throw new Error('No video URL provided')
  }

  let lastError: unknown
  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        referrer: TIKTOK_REFERER,
        referrerPolicy: 'origin',
      })

      if (!response.ok) {
        throw new Error(`Failed to download video (${response.status})`)
      }

      const blob = await response.blob()
      if (blob.size > MAX_VIDEO_SIZE_BYTES) {
        throw new Error('Video exceeds maximum size (50 MB)')
      }

      return blob
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to download video')
}
