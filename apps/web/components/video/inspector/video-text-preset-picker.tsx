'use client'

import { useMemo } from 'react'
import type { TextOverlayStyle } from '@socialista/types'
import { mergeTextPreset, TEXT_PRESETS, type TextPreset } from '@/lib/carousel/text-presets'
import { DEFAULT_TEXT_OVERLAY_STYLE } from '@/lib/video/defaults'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

const PREVIEW_SCALE = 0.18

type VideoTextPresetPickerProps = {
  currentStyle: TextOverlayStyle
  onApply: (style: Partial<TextOverlayStyle>) => void
}

function overlayFieldsFromLayerPreset(preset: Partial<import('@socialista/types').TextLayerStyle>): Partial<TextOverlayStyle> {
  return {
    fontFamily: preset.fontFamily,
    fontSize: preset.fontSize,
    fontWeight: preset.fontWeight,
    color: preset.color,
    backgroundColor: preset.backgroundColor,
    padding: preset.padding,
    borderRadius: preset.borderRadius,
    letterSpacing: preset.letterSpacing,
    lineHeight: preset.lineHeight,
  }
}

export function VideoTextPresetPicker({ currentStyle, onApply }: VideoTextPresetPickerProps) {
  const activeId = useMemo(() => matchActivePreset(currentStyle), [currentStyle])

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
                  const merged = mergeTextPreset(
                    { ...DEFAULT_TEXT_OVERLAY_STYLE, fontSize: 64 } as import('@socialista/types').TextLayerStyle,
                    preset.style,
                  )
                  onApply(overlayFieldsFromLayerPreset(merged))
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
    const merged = mergeTextPreset(
      { ...DEFAULT_TEXT_OVERLAY_STYLE, fontSize: 48 } as import('@socialista/types').TextLayerStyle,
      preset.style,
    )
    return {
      fontFamily: merged.fontFamily,
      fontWeight: merged.fontWeight,
      color: merged.color,
      backgroundColor: merged.backgroundColor ?? undefined,
      padding: `${(merged.padding ?? 0) * PREVIEW_SCALE}px`,
      borderRadius: `${(merged.borderRadius ?? 0) * PREVIEW_SCALE}px`,
      fontSize: `${(merged.fontSize ?? 48) * PREVIEW_SCALE}px`,
      lineHeight: merged.lineHeight ?? 1.2,
    }
  }, [preset.style])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex aspect-[4/3] flex-col items-center justify-center rounded-md border bg-neutral-900 p-1 transition-colors',
        active ? 'border-primary ring-1 ring-primary/40' : 'border-border/60 hover:border-primary/30',
      )}
      title={preset.label}
    >
      <span className="truncate px-0.5 text-center leading-tight" style={previewStyle}>
        Aa
      </span>
      <span className="mt-0.5 truncate text-[8px] text-muted-foreground">{preset.label}</span>
    </button>
  )
}

function matchActivePreset(style: TextOverlayStyle): string | null {
  for (const preset of TEXT_PRESETS) {
    const merged = overlayFieldsFromLayerPreset(
      mergeTextPreset(
        { ...DEFAULT_TEXT_OVERLAY_STYLE, fontSize: 64 } as import('@socialista/types').TextLayerStyle,
        preset.style,
      ),
    )
    if (
      merged.fontFamily === style.fontFamily &&
      merged.color === style.color &&
      merged.backgroundColor === style.backgroundColor &&
      merged.fontWeight === style.fontWeight
    ) {
      return preset.id
    }
  }
  return null
}
