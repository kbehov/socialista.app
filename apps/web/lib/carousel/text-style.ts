import type { CSSProperties } from 'react'
import type { TextLayerStyle, TextShadow } from '@socialista/types'

export function buildTextShadowCss(shadows: TextShadow[] | null | undefined, scale: number): string | undefined {
  if (!shadows?.length) return undefined
  return shadows
    .map(s => `${s.offsetX * scale}px ${s.offsetY * scale}px ${s.blur * scale}px ${s.color}`)
    .join(', ')
}

export function buildTextLayerCss(style: TextLayerStyle, scale: number): CSSProperties {
  const fontSizePx = style.fontSize * scale
  const paddingPx = (style.padding ?? 0) * scale
  const letterSpacingPx = (style.letterSpacing ?? 0) * scale
  const borderRadiusPx = (style.borderRadius ?? 0) * scale
  const strokeWidth = (style.textStrokeWidth ?? 0) * scale
  const textShadow = buildTextShadowCss(style.textShadow, scale)

  return {
    fontFamily: style.fontFamily,
    fontSize: `${fontSizePx}px`,
    fontWeight: style.fontWeight,
    color: style.color,
    backgroundColor: style.backgroundColor ?? 'transparent',
    textAlign: style.textAlign,
    letterSpacing: `${letterSpacingPx}px`,
    lineHeight: style.lineHeight ?? 1.2,
    padding: `${paddingPx}px`,
    borderRadius: `${borderRadiusPx}px`,
    textShadow,
    WebkitTextStroke: strokeWidth > 0 && style.textStrokeColor ? `${strokeWidth}px ${style.textStrokeColor}` : undefined,
    paintOrder: strokeWidth > 0 ? 'stroke fill' : undefined,
  }
}
