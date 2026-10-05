import { STUDIO_FONTS, studioFontFromCss, type StudioFontFace } from '@socialista/types'

const STYLE_ID = 'studio-fonts'

const dataUrlCache = new Map<string, Promise<string>>()

function faceRule(
  family: string,
  face: StudioFontFace,
  src: string,
  format: 'woff2' | 'truetype',
  swap = true,
): string {
  const display = swap ? 'font-display:swap;' : ''
  return `@font-face{font-family:"${family}";font-style:normal;font-weight:${face.weight};${display}src:url("${src}") format("${format}");}`
}

function studioFontCss(): string {
  return STUDIO_FONTS.flatMap(font => font.faces.map(face => faceRule(font.family, face, face.woff2, 'woff2'))).join('\n')
}

/** Inject @font-face rules once so picker previews and canvases can use the studio catalog. */
export function ensureStudioFonts(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = studioFontCss()
  document.head.appendChild(style)
}

export function collectFontFamilies(root: HTMLElement): string[] {
  const names = new Set<string>()
  const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')]
  for (const node of nodes) {
    const raw = node.style.fontFamily
    if (!raw) continue
    const name = raw.split(',')[0]?.replace(/["']/g, '').trim()
    if (name) names.add(name)
  }
  return [...names]
}

export async function loadUsedStudioFonts(families: readonly string[]): Promise<void> {
  ensureStudioFonts()
  if (typeof document === 'undefined' || !document.fonts) return
  const studio = families.filter(name => studioFontFromCss(name))
  await Promise.all(
    studio.flatMap(name => [
      document.fonts.load(`16px "${name}"`).catch(() => undefined),
      document.fonts.load(`700 16px "${name}"`).catch(() => undefined),
    ]),
  )
  await document.fonts.ready
}

function fontFileDataUrl(url: string): Promise<string> {
  const cached = dataUrlCache.get(url)
  if (cached) return cached
  const pending = fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to download font (${response.status})`)
      return response.blob()
    })
    .then(
      blob =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(reader.error ?? new Error('Failed to read font'))
          reader.readAsDataURL(blob)
        }),
    )
  dataUrlCache.set(url, pending)
  return pending
}

/** Inline the studio faces used on a node so html-to-image can paint them. */
export async function studioFontEmbedCss(families: readonly string[]): Promise<string> {
  const fonts = families.flatMap(name => {
    const font = studioFontFromCss(name)
    return font ? [font] : []
  })
  const rules = await Promise.all(
    fonts.flatMap(font =>
      font.faces.map(async face => faceRule(font.family, face, await fontFileDataUrl(face.woff2), 'woff2', false)),
    ),
  )
  return rules.join('\n')
}
