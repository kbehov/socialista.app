import { spawn } from 'node:child_process'
import ffmpegStaticImport from 'ffmpeg-static'

export type FfmpegProgressHandler = (progress: number) => void

function resolveFfmpegPath(): string {
  const fromEnv = process.env.FFMPEG_PATH
  if (fromEnv) return fromEnv

  const candidate =
    typeof ffmpegStaticImport === 'string'
      ? ffmpegStaticImport
      : ((ffmpegStaticImport as unknown as { default?: string | null })?.default ?? null)

  if (typeof candidate === 'string' && candidate.length > 0) return candidate
  return 'ffmpeg'
}

/**
 * Run ffmpeg with the given args. Progress is derived from `-progress pipe:1`
 * `out_time_us` relative to `durationSeconds`.
 */
export function runFfmpeg(options: {
  args: string[]
  durationSeconds: number
  onProgress?: FfmpegProgressHandler
  /** Throttle progress callbacks (ms). Default 500. */
  throttleMs?: number
}): Promise<void> {
  const { args, durationSeconds, onProgress, throttleMs = 500 } = options
  const bin = resolveFfmpegPath()
  const durationUs = Math.max(durationSeconds, 0.001) * 1_000_000

  return new Promise((resolve, reject) => {
    const child = spawn(bin, ['-hide_banner', '-nostats', '-progress', 'pipe:1', ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let lastEmit = 0
    let stderr = ''

    const emitProgress = (ratio: number) => {
      if (!onProgress) return
      const now = Date.now()
      if (now - lastEmit < throttleMs && ratio < 1) return
      lastEmit = now
      onProgress(Math.max(0, Math.min(1, ratio)))
    }

    child.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8')
      for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('out_time_us=')) {
          const us = Number(trimmed.slice('out_time_us='.length))
          if (Number.isFinite(us) && us >= 0) {
            emitProgress(us / durationUs)
          }
        } else if (trimmed === 'progress=end') {
          emitProgress(1)
        }
      }
    })

    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
      if (stderr.length > 64_000) {
        stderr = stderr.slice(-32_000)
      }
    })

    child.on('error', err => {
      reject(new Error(`Failed to start ffmpeg: ${err.message}`))
    })

    child.on('close', code => {
      if (code === 0) {
        emitProgress(1)
        resolve()
        return
      }
      const tail = stderr.trim().split('\n').slice(-12).join('\n')
      reject(new Error(`ffmpeg exited with code ${code}${tail ? `:\n${tail}` : ''}`))
    })
  })
}
