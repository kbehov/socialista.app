'use client'

import {
  StudioEmptyState,
  StudioPanelHeader,
  StudioPanelScrollArea,
  StudioPanelSection,
} from '@/components/carousel/studio-segmented-tabs'
import { Button } from '@/components/ui/button'
import { DEFAULT_LAYER_STYLE } from '@/lib/carousel/defaults'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { mergeTextPreset, getTextPreset, TEXT_PRESETS, type TextPreset } from '@/lib/carousel/text-presets'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { HeadingIcon, PlusIcon, TextIcon, TypeIcon } from 'lucide-react'
import { useMemo } from 'react'

const PREVIEW_SCALE = 0.26

/** Default look for new text layers from this panel. */
const DEFAULT_NEW_TEXT_PRESET = getTextPreset('soft-shadow')!

const QUICK_ADDS = [
  {
    id: 'heading',
    label: 'Heading',
    description: 'Bold title',
    icon: HeadingIcon,
    style: { fontSize: 72, fontWeight: 'bold' as const, textAlign: 'center' as const },
  },
  {
    id: 'body',
    label: 'Body',
    description: 'Paragraph',
    icon: TextIcon,
    style: { fontSize: 36, fontWeight: 'normal' as const, textAlign: 'center' as const },
  },
  {
    id: 'caption',
    label: 'Caption',
    description: 'Small line',
    icon: TypeIcon,
    style: { fontSize: 24, fontWeight: 'normal' as const, textAlign: 'center' as const },
  },
] as const

type PresetGroup = {
  id: string
  label: string
  presets: TextPreset[]
}

function groupPresets(presets: TextPreset[]): PresetGroup[] {
  const tiktok: TextPreset[] = []
  const classic: TextPreset[] = []
  const labels: TextPreset[] = []
  const styled: TextPreset[] = []

  for (const preset of presets) {
    if (preset.id.startsWith('tiktok-')) tiktok.push(preset)
    else if (
      ['classic', 'outline', 'thick-outline', 'inverted', 'shadow-stack', 'drop-shadow', 'hard-shadow', 'soft-shadow'].includes(
        preset.id,
      )
    ) {
      classic.push(preset)
    } else if (['label', 'highlight', 'caption', 'pill', 'alert'].includes(preset.id)) {
      labels.push(preset)
    } else {
      styled.push(preset)
    }
  }

  return [
    { id: 'tiktok', label: 'TikTok', presets: tiktok },
    { id: 'classic', label: 'Classic', presets: classic },
    { id: 'labels', label: 'Labels', presets: labels },
    { id: 'styled', label: 'Styled', presets: styled },
  ].filter(group => group.presets.length > 0)
}

export function StudioTextPanel({
  embedded = false,
  showPanelHeader,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const panelHeaderVisible = showPanelHeader ?? embedded
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const groups = useMemo(() => groupPresets(TEXT_PRESETS), [])

  const handleAddBlank = () => {
    if (!activeSlideId) return
    addTextLayer(activeSlideId, mergeTextPreset(DEFAULT_LAYER_STYLE, DEFAULT_NEW_TEXT_PRESET.style))
  }

  const handleQuickAdd = (style: (typeof QUICK_ADDS)[number]['style']) => {
    if (!activeSlideId) return
    addTextLayer(
      activeSlideId,
      mergeTextPreset(DEFAULT_LAYER_STYLE, { ...DEFAULT_NEW_TEXT_PRESET.style, ...style }),
    )
  }

  const handleAddPreset = (preset: TextPreset) => {
    if (!activeSlideId) return
    addTextLayer(activeSlideId, mergeTextPreset(DEFAULT_LAYER_STYLE, preset.style))
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {panelHeaderVisible ? (
        <div className="shrink-0 border-b border-border/50 px-3.5 py-3">
          <StudioPanelHeader title="Text" description="Add a text box or start from a preset" />
        </div>
      ) : null}
      <StudioPanelScrollArea>
        {!activeSlideId ? (
          <StudioEmptyState
            title="No slide selected"
            description="Select a slide on the canvas to add text."
          />
        ) : (
          <>
            <Button
              size="sm"
              className="h-9 w-full gap-2 rounded-lg text-[12px] font-medium tracking-tight shadow-xs"
              onClick={handleAddBlank}
            >
              <PlusIcon className="size-3.5" strokeWidth={2.25} />
              Add text box
            </Button>

            <StudioPanelSection title="Quick add">
              <div className="grid grid-cols-3 gap-1.5">
                {QUICK_ADDS.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuickAdd(item.style)}
                      className={cn(
                        'group flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-muted/10 px-1.5 py-2.5 text-center',
                        'transition-[background-color,border-color,box-shadow,transform] duration-150',
                        'hover:border-border/70 hover:bg-muted/30 hover:shadow-xs active:scale-[0.98]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                      )}
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-background shadow-xs ring-1 ring-border/40 transition-colors group-hover:ring-border/70">
                        <Icon className="size-3.5 text-foreground/75" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-medium tracking-tight text-foreground">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] leading-none text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </StudioPanelSection>

            {groups.map(group => (
              <StudioPanelSection key={group.id} title={group.label}>
                <div className="grid grid-cols-2 gap-2">
                  {group.presets.map(preset => (
                    <PresetCard key={preset.id} preset={preset} onClick={() => handleAddPreset(preset)} />
                  ))}
                </div>
              </StudioPanelSection>
            ))}
          </>
        )}
      </StudioPanelScrollArea>
    </div>
  )
}

function PresetCard({ preset, onClick }: { preset: TextPreset; onClick: () => void }) {
  const previewStyle = useMemo(() => {
    const merged = mergeTextPreset(DEFAULT_LAYER_STYLE, { ...preset.style, fontSize: 48 })
    return buildTextLayerCss(merged, PREVIEW_SCALE)
  }, [preset.style])

  const hasBox = Boolean(preset.style.backgroundColor)
  const swatch = preset.style.backgroundColor || 'transparent'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col items-stretch gap-2 rounded-xl border border-border/40 bg-muted/5 p-1.5 text-left',
        'transition-[background-color,border-color,box-shadow,transform] duration-150',
        'hover:border-border/70 hover:bg-muted/25 hover:shadow-xs active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      )}
    >
      <span
        className={cn(
          'relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg',
          hasBox ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-neutral-950',
        )}
        style={hasBox ? { backgroundColor: swatch } : undefined}
        aria-hidden
      >
        {!hasBox ? (
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.14),transparent_52%)]" />
        ) : (
          <span className="absolute inset-0 bg-black/5 dark:bg-black/20" />
        )}
        <span className="relative text-sm font-bold leading-none" style={previewStyle}>
          Aa
        </span>
      </span>
      <span className="truncate px-1 pb-0.5 text-[11px] font-medium tracking-tight text-foreground/90">
        {preset.label.replace(/^TikTok\s+/i, '')}
      </span>
    </button>
  )
}
