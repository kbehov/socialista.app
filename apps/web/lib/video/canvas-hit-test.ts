import type { TextOverlay } from '@socialista/types'

export function pointerToCanvasPercent(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}

export function hitTestOverlayAt(
  overlays: TextOverlay[],
  playhead: number,
  xPct: number,
  yPct: number,
): TextOverlay | null {
  const visible = overlays
    .filter(o => playhead >= o.startTime && playhead < o.endTime)
    .sort((a, b) => b.zIndex - a.zIndex)

  for (const overlay of visible) {
    if (
      xPct >= overlay.x &&
      xPct <= overlay.x + overlay.width &&
      yPct >= overlay.y &&
      yPct <= overlay.y + 20
    ) {
      return overlay
    }
  }

  return null
}
