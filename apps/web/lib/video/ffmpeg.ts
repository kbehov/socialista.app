import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()
let loadingPromise: Promise<void> | null = null

/** Lazily load the single-thread ffmpeg core. No COOP/COEP required. */
export async function loadFFmpeg(onLog?: (msg: string) => void): Promise<void> {
  if (ffmpeg.loaded) return
  if (!loadingPromise) {
    if (onLog) {
      ffmpeg.on('log', ({ message }) => onLog(message))
    }
    // classWorkerURL must be an absolute http(s) URL — a path like `/ffmpeg/worker.js`
    // is resolved against import.meta.url (file:// in the bundle) and breaks Workers.
    const classWorkerURL = new URL('/ffmpeg/worker.js', window.location.origin).href

    loadingPromise = ffmpeg
      .load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
        classWorkerURL,
      })
      .then(() => undefined)
  }
  await loadingPromise
}

export { ffmpeg, fetchFile }

export type FFmpegProgressHandler = (progress: number) => void

export function onFFmpegProgress(handler: FFmpegProgressHandler): () => void {
  const wrapped = ({ progress }: { progress: number }) => handler(Math.max(0, Math.min(1, progress)))
  ffmpeg.on('progress', wrapped)
  return () => ffmpeg.off('progress', wrapped)
}
