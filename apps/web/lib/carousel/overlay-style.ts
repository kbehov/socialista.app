export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(normalized)) return null

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map(char => char + char)
          .join('')
      : normalized

  const value = Number.parseInt(expanded, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

export function overlayFillColor(color: string, opacity: number): string {
  const rgb = parseHexColor(color)
  if (!rgb) return `rgba(0, 0, 0, ${opacity})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}
