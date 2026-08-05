/**
 * Parse a typed timecode string into seconds.
 * Accepts `M:SS`, `MM:SS`, `MM:SS:ff`, `H:MM:SS`, `HH:MM:SS:ff`, or plain seconds.
 */
export function parseTimecode(input: string, fps: number): number | null {
  const raw = input.trim()
  if (!raw) return null
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const secs = Number(raw)
    return Number.isFinite(secs) && secs >= 0 ? secs : null
  }

  const parts = raw.split(':').map(p => p.trim())
  if (parts.some(p => p === '' || !/^\d+$/.test(p))) return null
  const nums = parts.map(p => Number(p))
  const fpsClamped = Math.max(1, fps)

  if (nums.length === 2) {
    const [m, s] = nums as [number, number]
    if (s >= 60) return null
    return m * 60 + s
  }
  if (nums.length === 3) {
    // Ambiguous: could be MM:SS:ff or HH:MM:SS. Prefer frames when last part < fps.
    const [a, b, c] = nums as [number, number, number]
    if (c < fpsClamped && b < 60) {
      return a * 60 + b + c / fpsClamped
    }
    if (b < 60 && c < 60) {
      return a * 3600 + b * 60 + c
    }
    return null
  }
  if (nums.length === 4) {
    const [h, m, s, f] = nums as [number, number, number, number]
    if (m >= 60 || s >= 60 || f >= fpsClamped) return null
    return h * 3600 + m * 60 + s + f / fpsClamped
  }
  return null
}

/** Format seconds as timecode. Long form: HH:MM:SS:ff. Short form: MM:SS:ff. */
export function formatTimecode(time: number, fps: number, mode: 'long' | 'short' = 'short'): string {
  const safe = Math.max(0, time)
  const totalFrames = Math.round(safe * fps)
  const fpsClamped = Math.max(1, fps)
  const frames = totalFrames % fpsClamped
  const totalSeconds = Math.floor(totalFrames / fpsClamped)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0')
  if (mode === 'long' || hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`
  }
  return `${pad(minutes)}:${pad(seconds)}:${pad(frames)}`
}

/** Format seconds as a compact ruler tick label. */
export function formatRulerTick(time: number): string {
  const total = Math.max(0, Math.floor(time))
  const seconds = total % 60
  const minutes = Math.floor(total / 60)
  if (minutes === 0) return `${seconds}s`
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** Compute frame index for a given time. */
export function frameAtTime(time: number, fps: number): number {
  return Math.round(time * fps)
}

/** Time for a given frame index. */
export function timeAtFrame(frame: number, fps: number): number {
  return frame / fps
}
