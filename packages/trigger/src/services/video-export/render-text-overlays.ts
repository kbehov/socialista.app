import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import type { TextOverlay } from '@socialista/types'
import type { OverlayPng } from './build-filter-complex.js'

/** Approximate average glyph width as a fraction of font size (sans-serif). */
const CHAR_WIDTH_RATIO = 0.52
const BOLD_CHAR_WIDTH_RATIO = 0.58

function estimateTextWidth(text: string, fontPx: number, bold: boolean): number {
  const ratio = bold ? BOLD_CHAR_WIDTH_RATIO : CHAR_WIDTH_RATIO
  return text.length * fontPx * ratio
}

function wrapText(text: string, maxWidth: number, fontPx: number, bold: boolean): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (estimateTextWidth(candidate, fontPx, bold) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildOverlaySvg(
  overlay: TextOverlay,
  resolution: { width: number; height: number },
): string | null {
  const scalePercent = resolution.width / 100
  const style = overlay.style
  const widthPx = overlay.width * scalePercent
  const fontPx = style.fontSize * (resolution.width / 1080)
  const bold = style.fontWeight === 'bold'
  const padding = style.padding ?? 0
  const lineHeight = (style.lineHeight ?? 1.2) * fontPx
  const lines = wrapText(overlay.content || ' ', widthPx - padding * 2, fontPx, bold)

  let maxWidth = 0
  for (const line of lines) {
    const w = estimateTextWidth(line, fontPx, bold)
    if (w > maxWidth) maxWidth = w
  }

  const anchorX = overlay.x * scalePercent
  const anchorY = overlay.y * scalePercent
  const bgHeight = lines.length * lineHeight + padding * 2
  const cx = anchorX + widthPx / 2
  const cy = anchorY + fontPx
  const rotation = overlay.rotation

  const textEls: string[] = []
  let yCursor = anchorY
  for (const line of lines) {
    const lineWidth = estimateTextWidth(line, fontPx, bold)
    let x = anchorX + padding
    if (style.textAlign === 'center') x = anchorX + (widthPx - lineWidth) / 2
    else if (style.textAlign === 'right') x = anchorX + widthPx - lineWidth - padding
    textEls.push(
      `<text x="${x.toFixed(2)}" y="${(yCursor + fontPx * 0.85).toFixed(2)}" fill="${escapeXml(style.color)}" font-family="${escapeXml(style.fontFamily)}, sans-serif" font-size="${fontPx.toFixed(2)}" font-weight="${bold ? '700' : '400'}"${style.letterSpacing != null ? ` letter-spacing="${style.letterSpacing}"` : ''}>${escapeXml(line)}</text>`,
    )
    yCursor += lineHeight
  }

  let bgEl = ''
  if (style.backgroundColor) {
    const bgX =
      style.textAlign === 'center'
        ? anchorX + (widthPx - maxWidth) / 2 - padding
        : anchorX + (style.textAlign === 'right' ? widthPx - maxWidth - padding : 0)
    const radius = style.borderRadius ?? 0
    bgEl = `<rect x="${bgX.toFixed(2)}" y="${(anchorY - padding).toFixed(2)}" width="${(maxWidth + padding * 2).toFixed(2)}" height="${bgHeight.toFixed(2)}" rx="${radius}" ry="${radius}" fill="${escapeXml(style.backgroundColor)}" />`
  }

  const groupTransform =
    rotation !== 0
      ? ` transform="rotate(${rotation.toFixed(3)} ${cx.toFixed(2)} ${cy.toFixed(2)})"`
      : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${resolution.width}" height="${resolution.height}" viewBox="0 0 ${resolution.width} ${resolution.height}">
  <g${groupTransform}>
    ${bgEl}
    ${textEls.join('\n    ')}
  </g>
</svg>`
}

/**
 * Pre-render text overlays to transparent PNGs on disk.
 * v1: one static PNG per overlay (animations are preview-only).
 */
export async function renderOverlayPngs(
  overlays: TextOverlay[],
  resolution: { width: number; height: number },
  workDir: string,
): Promise<OverlayPng[]> {
  await mkdir(workDir, { recursive: true })
  const out: OverlayPng[] = []

  for (const overlay of overlays) {
    const svg = buildOverlaySvg(overlay, resolution)
    if (!svg) continue
    const fsPath = path.join(workDir, `text_${overlay.id}.png`)
    const png = await sharp(Buffer.from(svg)).png().toBuffer()
    await writeFile(fsPath, png)
    out.push({
      overlayId: overlay.id,
      fsPath,
      // PNG is full-frame with text already positioned — overlay at origin.
      x: 0,
      y: 0,
      start: overlay.startTime,
      end: overlay.endTime,
    })
  }

  return out
}
