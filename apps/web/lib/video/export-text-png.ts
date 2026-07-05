import type { TextOverlay } from '@socialista/types'

export type OverlayPng = {
  overlayId: string
  /** Path inside ffmpeg virtual FS. */
  fsPath: string
  /** x position in pixels (output frame). */
  x: number
  /** y position in pixels (output frame). */
  y: number
  /** Start time in seconds. */
  start: number
  /** End time in seconds. */
  end: number
}

/**
 * Pre-render text overlays to transparent PNGs and write them to the ffmpeg
 * virtual FS. Returns descriptors used by the filter_complex builder.
 *
 * v1 simplification: one static PNG per overlay (animations are preview-only).
 */
export async function renderOverlayPngs(
  ffmpeg: { writeFile: (path: string, data: Uint8Array) => Promise<void> },
  overlays: TextOverlay[],
  resolution: { width: number; height: number },
): Promise<OverlayPng[]> {
  const out: OverlayPng[] = []
  const scalePercent = resolution.width / 100
  for (const overlay of overlays) {
    const png = await renderOverlayPng(overlay, resolution)
    if (!png) continue
    const fsPath = `/text_${overlay.id}.png`
    await ffmpeg.writeFile(fsPath, png)
    const x = Math.round(overlay.x * scalePercent)
    const y = Math.round(overlay.y * scalePercent)
    out.push({
      overlayId: overlay.id,
      fsPath,
      x,
      y,
      start: overlay.startTime,
      end: overlay.endTime,
    })
  }
  return out
}

async function renderOverlayPng(
  overlay: TextOverlay,
  resolution: { width: number; height: number },
): Promise<Uint8Array | null> {
  if (typeof OffscreenCanvas === 'undefined') return null
  const canvas = new OffscreenCanvas(resolution.width, resolution.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const scalePercent = resolution.width / 100
  const style = overlay.style
  // Width in pixels
  const widthPx = overlay.width * scalePercent
  // Font size scaled to output resolution
  const fontPx = style.fontSize * (resolution.width / 1080)
  // Apply rotation around the overlay anchor
  ctx.save()
  const cx = overlay.x * scalePercent + widthPx / 2
  const cy = overlay.y * scalePercent + fontPx
  ctx.translate(cx, cy)
  ctx.rotate((overlay.rotation * Math.PI) / 180)
  ctx.translate(-cx, -cy)
  // Load font (web-safe stack from defaults)
  try {
    if ('fonts' in document) {
      await document.fonts.load(`${style.fontWeight} ${fontPx}px ${style.fontFamily}`)
    }
  } catch {
    // Ignore font load failure
  }
  ctx.font = `${style.fontWeight} ${fontPx}px ${style.fontFamily}`
  ctx.textAlign = style.textAlign
  ctx.textBaseline = 'top'
  if (style.letterSpacing !== undefined) {
    ctx.letterSpacing = `${style.letterSpacing}px`
  }
  // Wrap and draw text with optional background
  const anchorX = overlay.x * scalePercent
  const anchorY = overlay.y * scalePercent
  const padding = style.padding ?? 0
  const lineHeight = (style.lineHeight ?? 1.2) * fontPx
  const lines = wrapText(ctx, overlay.content || ' ', widthPx - padding * 2)
  // Measure background area
  let maxWidth = 0
  for (const line of lines) {
    const m = ctx.measureText(line)
    if (m.width > maxWidth) maxWidth = m.width
  }
  const bgHeight = lines.length * lineHeight + padding * 2
  if (style.backgroundColor) {
    ctx.fillStyle = style.backgroundColor
    const bgX = style.textAlign === 'center' ? anchorX + (widthPx - maxWidth) / 2 - padding : anchorX + (style.textAlign === 'right' ? widthPx - maxWidth - padding : 0)
    const radius = style.borderRadius ?? 0
    roundedRect(ctx, bgX, anchorY - padding, maxWidth + padding * 2, bgHeight, radius)
    ctx.fill()
  }
  ctx.fillStyle = style.color
  let yCursor = anchorY
  for (const line of lines) {
    const m = ctx.measureText(line)
    let x = anchorX + padding
    if (style.textAlign === 'center') x = anchorX + (widthPx - m.width) / 2
    else if (style.textAlign === 'right') x = anchorX + widthPx - m.width - padding
    ctx.fillText(line, x, yCursor)
    yCursor += lineHeight
  }
  ctx.restore()
  const blob = await canvas.convertToBlob({ type: 'image/png' })
  return new Uint8Array(await blob.arrayBuffer())
}

function wrapText(ctx: OffscreenCanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const m = ctx.measureText(candidate)
    if (m.width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function roundedRect(
  ctx: OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
