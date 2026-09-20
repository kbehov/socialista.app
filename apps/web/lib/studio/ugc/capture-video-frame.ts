const CAPTURE_TIMEOUT_MS = 20_000
const LAST_FRAME_OFFSET_SEC = 0.05

function toCapturableVideoUrl(url: string): string {
  if (!url || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/')) {
    return url
  }
  try {
    const parsed = new URL(url)
    if (parsed.pathname.includes('/api/media-proxy')) return url
    if (typeof window !== 'undefined' && parsed.origin === window.location.origin) return url
  } catch {
    return url
  }
  return `/api/media-proxy?url=${encodeURIComponent(url)}`
}

function waitForEvent(target: EventTarget, type: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const onEvent = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error("Couldn't read the video frame"))
    }
    const cleanup = () => {
      target.removeEventListener(type, onEvent)
      target.removeEventListener('error', onError)
      signal.removeEventListener('abort', onAbort)
    }
    signal.addEventListener('abort', onAbort, { once: true })
    target.addEventListener(type, onEvent, { once: true })
    target.addEventListener('error', onError, { once: true })
  })
}

export async function captureVideoLastFrame(videoUrl: string): Promise<Blob> {
  const video = document.createElement('video')
  video.crossOrigin = 'anonymous'
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS)

  try {
    video.src = toCapturableVideoUrl(videoUrl)
    await waitForEvent(video, 'loadedmetadata', controller.signal)
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await waitForEvent(video, 'loadeddata', controller.signal)
    }

    const duration = Number.isFinite(video.duration) ? video.duration : 0
    const seekTo = Math.max(0, duration - LAST_FRAME_OFFSET_SEC)
    if (seekTo > 0 && video.currentTime !== seekTo) {
      const seeked = waitForEvent(video, 'seeked', controller.signal)
      video.currentTime = seekTo
      await seeked
    }

    await new Promise<void>(resolve => {
      requestAnimationFrame(() => resolve())
    })

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) {
      throw new Error("Couldn't read the video frame")
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error("Couldn't read the video frame")
    ctx.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve, reject) => {
      try {
        canvas.toBlob(resolve, 'image/jpeg', 0.92)
      } catch (error) {
        reject(error)
      }
    })
    if (!blob) throw new Error("Couldn't read the video frame")
    return blob
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error("Couldn't read the video frame")
    }
    throw error instanceof Error ? error : new Error("Couldn't read the video frame")
  } finally {
    window.clearTimeout(timeout)
    video.removeAttribute('src')
    video.load()
  }
}
