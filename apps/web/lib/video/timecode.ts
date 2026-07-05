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
