import { THUMBNAIL_COUNT, WAVEFORM_PEAKS } from './defaults'
import type { MediaAsset } from './types'
import { inferMediaType } from './types'
import type { MediaType } from '@socialista/types'

export class MediaImportError extends Error {
  constructor(message: string, readonly code: 'too-large' | 'unsupported' | 'decode-failed') {
    super(message)
    this.name = 'MediaImportError'
  }
}

async function sha1(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-1', buffer)
  const bytes = new Uint8Array(digest)
  let hex = ''
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0')
  }
  return hex
}

function makeObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

function generateId(): string {
  return `asset_${Math.random().toString(36).slice(2, 10)}`
}

function loadVideoElement(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    const onLoaded = () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('error', onError)
      resolve(video)
    }
    const onError = () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('error', onError)
      reject(new MediaImportError('Failed to load video metadata', 'decode-failed'))
    }
    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('error', onError)
    video.src = src
  })
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const onLoaded = () => {
      img.removeEventListener('load', onLoaded)
      img.removeEventListener('error', onError)
      resolve(img)
    }
    const onError = () => {
      img.removeEventListener('load', onLoaded)
      img.removeEventListener('error', onError)
      reject(new MediaImportError('Failed to load image', 'decode-failed'))
    }
    img.addEventListener('load', onLoaded)
    img.addEventListener('error', onError)
    img.src = src
  })
}

function captureFrameToDataUrl(video: HTMLVideoElement, width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  // Letterbox/pillarbox to fit; preserve aspect by drawing full frame scaled.
  const vw = video.videoWidth || width
  const vh = video.videoHeight || height
  const scale = Math.max(width / vw, height / vh)
  const drawW = vw * scale
  const drawH = vh * scale
  const dx = (width - drawW) / 2
  const dy = (height - drawH) / 2
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(video, dx, dy, drawW, drawH)
  return canvas.toDataURL('image/jpeg', 0.6)
}

const POOL_THUMB_WIDTH = 160
const POOL_THUMB_HEIGHT = 90

function captureImageToDataUrl(img: HTMLImageElement, width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const scale = Math.max(width / iw, height / ih)
  const drawW = iw * scale
  const drawH = ih * scale
  const dx = (width - drawW) / 2
  const dy = (height - drawH) / 2
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, dx, dy, drawW, drawH)
  return canvas.toDataURL('image/jpeg', 0.6)
}

async function captureImageThumbnail(src: string): Promise<string> {
  const img = await loadImageElement(src)
  return captureImageToDataUrl(img, POOL_THUMB_WIDTH, POOL_THUMB_HEIGHT)
}

async function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      resolve()
    }
    const onError = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      reject(new MediaImportError('Video seek failed', 'decode-failed'))
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0))
  })
}

async function captureVideoThumbnails(file: File, src: string, duration: number): Promise<string[]> {
  const video = await loadVideoElement(src)
  const thumbs: string[] = []
  try {
    const segment = duration / (THUMBNAIL_COUNT + 1)
    for (let i = 1; i <= THUMBNAIL_COUNT; i++) {
      const t = segment * i
      // Skip near-end seeks that may stall.
      if (t >= duration - 0.05) continue
      await seekVideo(video, t)
      const data = captureFrameToDataUrl(video, POOL_THUMB_WIDTH, POOL_THUMB_HEIGHT)
      if (data) thumbs.push(data)
    }
  } finally {
    video.removeAttribute('src')
    video.load()
  }
  return thumbs
}

async function probeAudio(file: File): Promise<{ duration: number; sampleRate: number }> {
  const arrayBuffer = await file.arrayBuffer()
  // Use a temporary AudioContext to decode; OfflineAudioContext requires sampleRate up-front.
  const AudioCtor: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const tmpCtx = new AudioCtor()
  try {
    const audioBuffer = await tmpCtx.decodeAudioData(arrayBuffer.slice(0))
    return { duration: audioBuffer.duration, sampleRate: audioBuffer.sampleRate }
  } finally {
    void tmpCtx.close()
  }
}

async function computeWaveform(file: File, sampleRate: number): Promise<Int8Array> {
  const arrayBuffer = await file.arrayBuffer()
  const OfflineCtor: typeof OfflineAudioContext =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext
  const ctx = new OfflineCtor(1, Math.ceil(sampleRate * 0.001), sampleRate)
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0))
    // If multi-channel, mix down to mono using channel 0 for performance.
    const channel = audioBuffer.getChannelData(0)
    const samplesPerPixel = Math.max(1, Math.floor(channel.length / WAVEFORM_PEAKS))
    const peaks = new Int8Array(WAVEFORM_PEAKS * 2)
    for (let p = 0; p < WAVEFORM_PEAKS; p++) {
      const start = p * samplesPerPixel
      const end = Math.min(start + samplesPerPixel, channel.length)
      let min = 0
      let max = 0
      for (let i = start; i < end; i++) {
        const v = channel[i] ?? 0
        if (v < min) min = v
        if (v > max) max = v
      }
      peaks[p * 2] = Math.round(min * 127)
      peaks[p * 2 + 1] = Math.round(max * 127)
    }
    return peaks
  } catch (err) {
    throw new MediaImportError(
      `Failed to decode audio: ${err instanceof Error ? err.message : 'unknown error'}`,
      'decode-failed',
    )
  }
}

async function probeVideoOrImage(
  file: File,
  src: string,
  type: 'video' | 'image',
): Promise<{ duration: number; width: number; height: number; thumbnails: string[] }> {
  if (type === 'image') {
    const img = await loadImageElement(src)
    const thumb = await captureImageThumbnail(src)
    return {
      duration: 0,
      width: img.naturalWidth,
      height: img.naturalHeight,
      thumbnails: [thumb],
    }
  }
  const video = await loadVideoElement(src)
  const duration = video.duration
  const width = video.videoWidth
  const height = video.videoHeight
  const thumbnails = await captureVideoThumbnails(file, src, duration)
  video.removeAttribute('src')
  video.load()
  return { duration, width, height, thumbnails }
}

export async function importMediaAsset(file: File): Promise<MediaAsset> {
  const type = inferMediaType(file)
  if (!type) {
    throw new MediaImportError(`Unsupported file type: ${file.type || file.name}`, 'unsupported')
  }
  if (file.size > 500 * 1024 * 1024) {
    throw new MediaImportError('File exceeds the 500MB hard import limit', 'too-large')
  }
  const hash = await sha1(file)
  const objectUrl = makeObjectUrl(file)
  const id = generateId()
  try {
    if (type === 'audio') {
      const { duration, sampleRate } = await probeAudio(file)
      const waveform = await computeWaveform(file, sampleRate)
      return { id, name: file.name, type, file, objectUrl, hash, duration, waveform }
    }
    const { duration, width, height, thumbnails } = await probeVideoOrImage(file, objectUrl, type as 'video' | 'image')
    return { id, name: file.name, type: type as MediaType, file, objectUrl, hash, duration, width, height, thumbnails }
  } catch (err) {
    URL.revokeObjectURL(objectUrl)
    if (err instanceof MediaImportError) throw err
    throw new MediaImportError(
      `Failed to import media: ${err instanceof Error ? err.message : 'unknown error'}`,
      'decode-failed',
    )
  }
}

/** Build a MediaAsset placeholder from a serialized asset (no File/objectUrl). */
export function mediaAssetFromSerialized(serialized: MediaAsset): MediaAsset {
  return serialized
}

export function proxiedMediaUrl(url: string): string {
  return `/api/media-proxy?url=${encodeURIComponent(url)}`
}

function filenameFromUrl(url: string, contentType: string): string {
  try {
    const pathname = new URL(url).pathname
    const base = pathname.split('/').pop()
    if (base && base.includes('.')) return decodeURIComponent(base)
  } catch {
    // ignore
  }
  const subtype = contentType.split('/')[1]?.split('+')[0] ?? 'bin'
  return `import.${subtype}`
}

export async function importMediaFromUrl(remoteUrl: string, name?: string): Promise<MediaAsset> {
  const trimmed = remoteUrl.trim()
  if (!trimmed || !/^https?:\/\//.test(trimmed)) {
    throw new MediaImportError('Enter a valid http(s) URL', 'unsupported')
  }

  const proxyUrl = proxiedMediaUrl(trimmed)
  let response: Response
  try {
    response = await fetch(proxyUrl)
  } catch {
    throw new MediaImportError('Failed to fetch media from URL', 'decode-failed')
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new MediaImportError('File exceeds the 500MB import limit', 'too-large')
    }
    throw new MediaImportError(`Failed to fetch media (${response.status})`, 'decode-failed')
  }

  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? 'application/octet-stream'
  const blob = await response.blob()
  const filename = name ?? filenameFromUrl(trimmed, contentType)
  const file = new File([blob], filename, { type: contentType || blob.type })

  return importMediaAsset(file)
}
