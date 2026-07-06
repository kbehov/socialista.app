'use client'

import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import type { Slide } from '@socialista/types'

type ExportOptions = {
  pixelRatio?: number
}

/**
 * Render a slide to a PNG data URL at the project's reference canvas resolution.
 * Caller must provide a DOM node that contains the fully-rendered slide canvas.
 */
export async function exportSlideToPng(node: HTMLElement, options: ExportOptions = {}): Promise<string> {
  return toPng(node, {
    pixelRatio: options.pixelRatio ?? 1,
    // cacheBust re-fetches images and breaks blob: URLs from uploads.
    cacheBust: false,
    // Avoid font fetch failures during export; text is already laid out in the DOM.
    skipFonts: true,
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  downloadBlob(dataUrlToBlob(dataUrl), filename)
}

export function slideFilename(slide: Slide, index: number): string {
  return `slide-${String(index + 1).padStart(2, '0')}.png`
}

type ExportProgress = {
  onProgress?: (current: number, total: number) => void
}

/** Render each slide off-screen to PNG files at the project's reference canvas width. */
export async function renderSlidesToFiles(
  slides: Slide[],
  canvasWidth: number,
  { onProgress }: ExportProgress = {},
): Promise<File[]> {
  if (slides.length === 0) return []

  const sorted = [...slides].sort((a, b) => a.order - b.order)
  const { createRoot } = await import('react-dom/client')
  const { flushSync } = await import('react-dom')
  const { createElement } = await import('react')
  const { SlideCanvas } = await import('@/components/carousel/slide-canvas')

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '0'
  container.style.top = '0'
  container.style.zIndex = '-1'
  container.style.opacity = '0'
  container.style.pointerEvents = 'none'
  container.style.width = `${canvasWidth}px`
  document.body.appendChild(container)

  const root = createRoot(container)
  const files: File[] = []

  try {
    for (let i = 0; i < sorted.length; i++) {
      const slide = sorted[i]!

      flushSync(() => {
        root.render(
          createElement(SlideCanvas, {
            slide,
            interactive: false,
            forceWidth: canvasWidth,
          }),
        )
      })

      await prepareSlideForExport(container)

      const node = container.querySelector<HTMLElement>('[data-slide-canvas]')
      if (!node) {
        throw new Error(`Could not render slide ${i + 1} for export`)
      }

      const dataUrl = await exportSlideToPng(node)
      const blob = dataUrlToBlob(dataUrl)
      files.push(new File([blob], slideFilename(slide, i), { type: 'image/png' }))
      onProgress?.(i + 1, sorted.length)
    }

    return files
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}

/** Render each slide off-screen and download as a single ZIP (avoids browser multi-download blocking). */
export async function exportSlidesAsZip(
  slides: Slide[],
  canvasWidth: number,
  { onProgress }: ExportProgress = {},
): Promise<void> {
  const files = await renderSlidesToFiles(slides, canvasWidth, { onProgress })
  if (files.length === 0) return

  const zip = new JSZip()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const base64 = await blobToBase64(file)
    zip.file(file.name, base64, { base64: true })
    onProgress?.(i + 1, files.length)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, 'slideshow.zip')
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'))
    reader.readAsDataURL(blob)
  })
}

async function prepareSlideForExport(container: HTMLElement): Promise<void> {
  await document.fonts?.ready

  const images = Array.from(container.querySelectorAll('img'))

  // Replace remote http(s) URLs with our same-origin proxy so the browser
  // sends CORS-friendly requests and we can later draw them onto a canvas.
  await Promise.all(
    images.map(img => {
      if (!img.src.startsWith('http')) return Promise.resolve()
      const originalSrc = img.src
      img.crossOrigin = 'anonymous'
      img.src = `/api/image-proxy?url=${encodeURIComponent(originalSrc)}`
      return new Promise<void>(resolve => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
      })
    }),
  )

  // Wait for any remaining images (blob: URLs from file uploads etc.).
  await Promise.all(
    images.map(
      img =>
        new Promise<void>(resolve => {
          if (img.complete) { resolve(); return }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  )

  // Serialize each loaded image to a data URL so html-to-image can inline it.
  for (const img of images) {
    if (!img.naturalWidth || !img.naturalHeight) continue
    if (img.src.startsWith('data:')) continue

    try {
      const offscreen = document.createElement('canvas')
      offscreen.width = img.naturalWidth
      offscreen.height = img.naturalHeight
      const ctx = offscreen.getContext('2d')
      if (!ctx) continue
      ctx.drawImage(img, 0, 0)
      img.src = offscreen.toDataURL('image/png')
    } catch {
      // Image couldn't be serialised — html-to-image will omit it.
    }
  }

  // Two frames so layout has settled before we capture the bitmap.
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header?.match(/:(.*?);/)?.[1] ?? 'image/png'
  const binary = atob(base64 ?? '')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}
