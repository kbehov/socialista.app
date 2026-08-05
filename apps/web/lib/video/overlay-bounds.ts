import type { TextOverlay } from '@socialista/types'

/**
 * Estimate overlay height as % of canvas from typography.
 * Prefer a live DOM measurement when available — this is the fallback.
 */
export function estimateTextOverlayHeightPct(
  overlay: Pick<TextOverlay, 'content' | 'style' | 'width'>,
  canvasHeightPx: number,
): number {
  if (canvasHeightPx <= 0) return 12

  const fontSize = Math.max(1, overlay.style.fontSize || 64)
  const lineHeight = overlay.style.lineHeight ?? 1.2
  const padding = overlay.style.padding ?? 0
  const raw = (overlay.content || ' ').replace(/\r\n/g, '\n')
  const explicitLines = Math.max(1, raw.split('\n').length)

  // Rough wrap estimate: average glyph ~0.55em, width is % of a square-ish frame.
  // Use canvas height as a stand-in for width when aspect is unknown (conservative).
  const widthPx = canvasHeightPx * (Math.max(5, overlay.width) / 100)
  const avgCharPx = fontSize * 0.55
  const charsPerLine = Math.max(1, Math.floor(widthPx / avgCharPx))
  const wrappedLines = raw.split('\n').reduce((sum, line) => {
    const len = Math.max(1, line.length)
    return sum + Math.max(1, Math.ceil(len / charsPerLine))
  }, 0)

  const lines = Math.max(explicitLines, wrappedLines)
  const heightPx = fontSize * lineHeight * lines + padding * 2
  return Math.max(2, Math.min(100, (heightPx / canvasHeightPx) * 100))
}

/** Keep a percent-rect fully inside the 0–100 canvas bounds. */
export function containPercentRect(rect: {
  x: number
  y: number
  width: number
  height: number
}): { x: number; y: number; width: number; height: number } {
  const width = Math.min(Math.max(1, rect.width), 100)
  const height = Math.min(Math.max(1, rect.height), 100)
  return {
    width,
    height,
    x: Math.min(Math.max(0, rect.x), 100 - width),
    y: Math.min(Math.max(0, rect.y), 100 - height),
  }
}

/** Read rendered overlay height from the artboard DOM, as % of artboard height. */
export function measureOverlayHeightPct(
  artboard: HTMLElement | null | undefined,
  overlayId: string,
): number | null {
  if (!artboard) return null
  const el = artboard.querySelector(`[data-video-overlay="${overlayId}"]`) as HTMLElement | null
  if (!el) return null
  const canvasH = artboard.getBoundingClientRect().height
  if (canvasH <= 0) return null
  const heightPct = (el.getBoundingClientRect().height / canvasH) * 100
  if (!Number.isFinite(heightPct) || heightPct <= 0) return null
  return Math.max(2, Math.min(100, heightPct))
}
