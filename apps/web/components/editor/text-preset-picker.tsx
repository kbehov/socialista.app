'use client'

import { useMemo } from 'react'
import type { TextLayerStyle } from '@socialista/types'
import { mergeTextPreset, TEXT_PRESETS, type TextPreset } from '@/lib/carousel/text-presets'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { DEFAULT_LAYER_STYLE } from '@/lib/carousel/defaults'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const PREVIEW_SCALE = 0.22

type TextPresetPickerProps<TStyle = TextLayerStyle> = {
  currentStyle: TStyle
  onApply: (style: TStyle) => void
  /** Convert domain style → TextLayerStyle for matching/preview. Default: identity. */
  toLayerStyle?: (style: TStyle) => TextLayerStyle
  /** Convert TextLayerStyle → domain style when applying a preset. Default: identity. */
  fromLayerStyle?: (style: TextLayerStyle) => TStyle
  baseStyle?: TextLayerStyle
  variant?: 'grid' | 'accordion'
  className?: string
}

export function TextPresetPicker<TStyle = TextLayerStyle>({
  currentStyle,
  onApply,
  toLayerStyle,
  fromLayerStyle,
  baseStyle = DEFAULT_LAYER_STYLE,
  variant = 'grid',
  className,
}: TextPresetPickerProps<TStyle>) {
  const toLayer = toLayerStyle ?? ((s: TStyle) => s as unknown as TextLayerStyle)
  const fromLayer = fromLayerStyle ?? ((s: TextLayerStyle) => s as unknown as TStyle)
  const layerStyle = useMemo(() => toLayer(currentStyle), [currentStyle, toLayer])
  const activeId = useMemo(() => matchActivePreset(layerStyle, baseStyle), [baseStyle, layerStyle])

  const grid = (
    <div className={cn('grid max-h-40 grid-cols-3 gap-1.5 overflow-y-auto pr-0.5', className)}>
      {TEXT_PRESETS.map(preset => (
        <PresetButton
          key={preset.id}
          preset={preset}
          active={activeId === preset.id}
          baseStyle={baseStyle}
          onClick={() => onApply(fromLayer(mergeTextPreset(layerStyle, preset.style)))}
        />
      ))}
    </div>
  )

  if (variant === 'accordion') {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="presets" className="border-none">
          <AccordionTrigger className="py-1.5 text-[11px] font-medium text-muted-foreground hover:no-underline">
            Text presets
          </AccordionTrigger>
          <AccordionContent className="pb-1 pt-0">
            <div className={cn('grid max-h-56 grid-cols-3 gap-1.5 overflow-y-auto pr-0.5', className)}>
              {TEXT_PRESETS.map(preset => (
                <PresetButton
                  key={preset.id}
                  preset={preset}
                  active={activeId === preset.id}
                  baseStyle={baseStyle}
                  onClick={() => onApply(fromLayer(mergeTextPreset(layerStyle, preset.style)))}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground">Presets</p>
      {grid}
    </div>
  )
}

function PresetButton({
  preset,
  active,
  onClick,
  baseStyle,
}: {
  preset: TextPreset
  active: boolean
  onClick: () => void
  baseStyle: TextLayerStyle
}) {
  const previewStyle = useMemo(() => {
    const merged = mergeTextPreset(baseStyle, { ...preset.style, fontSize: 48 })
    return buildTextLayerCss(merged, PREVIEW_SCALE)
  }, [baseStyle, preset.style])

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
      title={preset.label}
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

function matchActivePreset(style: TextLayerStyle, baseStyle: TextLayerStyle): string | null {
  for (const preset of TEXT_PRESETS) {
    const merged = mergeTextPreset(baseStyle, preset.style)
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
