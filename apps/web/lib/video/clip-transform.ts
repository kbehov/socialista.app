import type { ClipTransform, VideoClip } from '@socialista/types'

export function computeCoverFitTransform(
  canvasW: number,
  canvasH: number,
  mediaW: number,
  mediaH: number,
): ClipTransform {
  if (mediaW <= 0 || mediaH <= 0) {
    return { x: 0, y: 0, width: 100, rotation: 0 }
  }

  const scale = Math.max(canvasW / mediaW, canvasH / mediaH)
  const drawW = mediaW * scale
  const drawH = mediaH * scale
  const dx = (canvasW - drawW) / 2
  const dy = (canvasH - drawH) / 2

  return {
    x: (dx / canvasW) * 100,
    y: (dy / canvasH) * 100,
    width: (drawW / canvasW) * 100,
    rotation: 0,
  }
}

export function resolveClipTransform(
  clip: VideoClip,
  canvasW: number,
  canvasH: number,
  mediaW: number,
  mediaH: number,
): ClipTransform {
  if (clip.transform) return clip.transform
  return computeCoverFitTransform(canvasW, canvasH, mediaW, mediaH)
}

export function getClipHeightPercent(
  transform: ClipTransform,
  canvasW: number,
  canvasH: number,
  mediaW: number,
  mediaH: number,
): number {
  if (mediaW <= 0 || mediaH <= 0) return transform.width
  const widthPx = (transform.width / 100) * canvasW
  const heightPx = widthPx * (mediaH / mediaW)
  return (heightPx / canvasH) * 100
}

export function clipHasCustomTransform(clip: VideoClip): boolean {
  return clip.transform !== undefined
}
