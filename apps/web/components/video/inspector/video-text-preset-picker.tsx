'use client'

import { useMemo } from 'react'
import type { TextOverlayStyle } from '@socialista/types'
import { mergeTextPreset, TEXT_PRESETS, type TextPreset } from '@/lib/carousel/text-presets'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { DEFAULT_TEXT_LAYER_BASE, layerStyleFromOverlay, overlayStyleFromLayer } from '@/lib/video/defaults'
import type { TextLayerStyle } from '@socialista/types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

const PREVIEW_SCALE = 0.22

type VideoTextPresetPickerProps = {
  currentStyle: TextOverlayStyle
  onApply: (style: Partial<TextOverlayStyle>) => void
}

export function VideoTextPresetPicker({ currentStyle, onApply }: VideoTextPresetPickerProps) {
  const layerStyle = useMemo(() => layerStyleFromOverlay(currentStyle), [currentStyle])
  const activeId = useMemo(() => matchActivePreset(layerStyle), [layerStyle])

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="presets" className="border-none">
        <AccordionTrigger className="py-1.5 text-[11px] font-medium text-muted-foreground hover:no-underline">
          Text presets
        </AccordionTrigger>
        <AccordionContent className="pb-1 pt-0">
          <div className="grid max-h-56 grid-cols-3 gap-1.5 overflow-y-auto pr-0.5">
            {TEXT_PRESETS.map(preset => (
              <PresetButton
                key={preset.id}
                preset={preset}
                active={activeId === preset.id}
                onClick={() => {
                  const merged = mergeTextPreset(layerStyle, preset.style)
                  onApply(overlayStyleFromLayer(merged))
                }}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
    const merged = mergeTextPreset(DEFAULT_TEXT_LAYER_BASE, { ...preset.style, fontSize: 48 })
    return buildTextLayerCss(merged, PREVIEW_SCALE)
  }, [preset.style])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 rounded-md border px-1.5 py-2 transition',
        active
          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
          : 'border-border bg-background hover:border-muted-foreground/30 hover:bg-muted/40',
      )}
      title={preset.label}
    >
      <span
        className="flex h-7 w-full items-center justify-center overflow-hidden rounded-sm bg-neutral-900 text-sm font-bold leading-none"
        style={previewStyle}
        aria-hidden
      >
        Aa
      </span>
      <span className="text-[9px] font-medium text-muted-foreground">{preset.label}</span>
    </button>
  )
}

function matchActivePreset(style: TextLayerStyle): string | null {
  for (const preset of TEXT_PRESETS) {
    const merged = mergeTextPreset(DEFAULT_TEXT_LAYER_BASE, preset.style)
    if (stylesMatch(merged, style)) return preset.id
  }
  return null
}

function stylesMatch(a: TextLayerStyle, b: TextLayerStyle): boolean {
  return (
    a.fontFamily === b.fontFamily &&
    a.color === b.color &&
    a.backgroundColor === b.backgroundColor &&
    a.fontWeight === b.fontWeight &&
    (a.textStrokeColor ?? null) === (b.textStrokeColor ?? null) &&
    (a.textStrokeWidth ?? 0) === (b.textStrokeWidth ?? 0) &&
    shadowsEqual(a.textShadow, b.textShadow)
  )
}

function shadowsEqual(
  a: TextLayerStyle['textShadow'],
  b: TextLayerStyle['textShadow'],
): boolean {
  if (!a?.length && !b?.length) return true
  if (!a || !b || a.length !== b.length) return false
  return a.every(
    (s, i) =>
      s.offsetX === b[i]!.offsetX &&
      s.offsetY === b[i]!.offsetY &&
      s.blur === b[i]!.blur &&
      s.color === b[i]!.color,
  )
}
