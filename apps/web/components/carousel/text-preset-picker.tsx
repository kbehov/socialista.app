'use client'

import { useMemo } from 'react'
import type { TextLayerStyle } from '@socialista/types'
import { mergeTextPreset, TEXT_PRESETS, type TextPreset } from '@/lib/carousel/text-presets'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { DEFAULT_LAYER_STYLE } from '@/lib/carousel/defaults'
import { cn } from '@/lib/utils'

const PREVIEW_SCALE = 0.22

type TextPresetPickerProps = {
  currentStyle: TextLayerStyle
  onApply: (style: TextLayerStyle) => void
}

export function TextPresetPicker({ currentStyle, onApply }: TextPresetPickerProps) {
  const activeId = useMemo(() => matchActivePreset(currentStyle), [currentStyle])

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground">Presets</p>
      <div className="grid max-h-40 grid-cols-3 gap-1.5 overflow-y-auto pr-0.5">
        {TEXT_PRESETS.map(preset => (
          <PresetButton
            key={preset.id}
            preset={preset}
            active={activeId === preset.id}
            onClick={() => onApply(mergeTextPreset(currentStyle, preset.style))}
          />
        ))}
      </div>
    </div>
  )
}

function PresetButton({
  preset,
  active,
  onClick,
}: {
  preset: TextPreset
  active: boolean
  onClick: () => void
}) {
  const previewStyle = useMemo(() => {
    const merged = mergeTextPreset(DEFAULT_LAYER_STYLE, { ...preset.style, fontSize: 48 })
    return buildTextLayerCss(merged, PREVIEW_SCALE)
  }, [preset.style])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border px-1.5 py-2 transition-all duration-150',
        active
          ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/25'
          : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40',
      )}
    >
      <span
        className="flex h-7 w-full items-center justify-center overflow-hidden rounded-md bg-neutral-900 text-sm font-bold leading-none"
        style={previewStyle}
        aria-hidden
      >
        Aa
      </span>
      <span className="truncate text-[9px] font-medium text-muted-foreground">
        {preset.label.replace(/^TikTok\s+/i, '')}
      </span>
    </button>
  )
}

function matchActivePreset(style: TextLayerStyle): string | null {
  for (const preset of TEXT_PRESETS) {
    const merged = mergeTextPreset(DEFAULT_LAYER_STYLE, preset.style)
    if (stylesMatch(style, merged)) return preset.id
  }
  return null
}

function stylesMatch(a: TextLayerStyle, b: TextLayerStyle): boolean {
  return (
    a.color === b.color &&
    a.backgroundColor === b.backgroundColor &&
    a.fontFamily === b.fontFamily &&
    a.fontWeight === b.fontWeight &&
    (a.textStrokeColor ?? null) === (b.textStrokeColor ?? null) &&
    (a.textStrokeWidth ?? 0) === (b.textStrokeWidth ?? 0) &&
    (a.padding ?? 0) === (b.padding ?? 0) &&
    (a.borderRadius ?? 0) === (b.borderRadius ?? 0) &&
    (a.letterSpacing ?? 0) === (b.letterSpacing ?? 0) &&
    shadowsEqual(a.textShadow, b.textShadow)
  )
}

function shadowsEqual(a: TextLayerStyle['textShadow'], b: TextLayerStyle['textShadow']): boolean {
  if (!a?.length && !b?.length) return true
  if (!a || !b || a.length !== b.length) return false
  return a.every((s, i) => {
    const other = b[i]
    return (
      other &&
      s.offsetX === other.offsetX &&
      s.offsetY === other.offsetY &&
      s.blur === other.blur &&
      s.color === other.color
    )
  })
}
