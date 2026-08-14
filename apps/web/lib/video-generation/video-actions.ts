function extensionFromMime(mime: string): string {
  if (mime.includes('webm')) return 'webm'
  if (mime.includes('quicktime') || mime.includes('mov')) return 'mov'
  if (mime.includes('ogg')) return 'ogv'
  return 'mp4'
}

export function buildGeneratedVideoFilename(prompt?: string): string {
  const slug = (prompt ?? 'video')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  return `generated-${slug || 'video'}-${Date.now()}`
}

async function fetchVideoBlob(videoUrl: string): Promise<Blob> {
  const response = await fetch(videoUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch video')
  }
  return response.blob()
}

export async function downloadGeneratedVideo(videoUrl: string, prompt?: string): Promise<void> {
  try {
    const blob = await fetchVideoBlob(videoUrl)
    const ext = extensionFromMime(blob.type)
    const filename = `${buildGeneratedVideoFilename(prompt)}.${ext}`
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(videoUrl, '_blank', 'noopener,noreferrer')
  }
}
