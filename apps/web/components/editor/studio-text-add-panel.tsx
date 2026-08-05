'use client'

import {
  EditorEmptyState,
  EditorPanelHeader,
  EditorPanelScrollArea,
} from '@/components/editor/panel-shell'
import { Button } from '@/components/ui/button'
import { DEFAULT_LAYER_STYLE } from '@/lib/carousel/defaults'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { mergeTextPreset, getTextPreset, TEXT_PRESETS, type TextPreset } from '@/lib/carousel/text-presets'
import { cn } from '@/lib/utils'
import type { TextLayerStyle } from '@socialista/types'
import { PlusIcon } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'

const PREVIEW_SCALE = 0.28

/** Default look for new text layers from this panel. */
const DEFAULT_NEW_TEXT_PRESET = getTextPreset('soft-shadow')!

export const STUDIO_TEXT_QUICK_ADDS = [
  {
    id: 'heading',
    label: 'Heading',
    sample: 'Aa',
    previewSize: 56,
    style: { fontSize: 72, fontWeight: 'bold' as const, textAlign: 'center' as const },
  },
  {
    id: 'body',
    label: 'Body',
    sample: 'Aa',
    previewSize: 36,
    style: { fontSize: 36, fontWeight: 'normal' as const, textAlign: 'center' as const },
  },
  {
    id: 'caption',
    label: 'Caption',
    sample: 'Aa',
    previewSize: 24,
    style: { fontSize: 24, fontWeight: 'normal' as const, textAlign: 'center' as const },
  },
] as const

type PresetGroup = {
  id: string
  label: string
  presets: TextPreset[]
}

export function groupStudioTextPresets(presets: TextPreset[]): PresetGroup[] {
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

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-w-0 px-0.5">
      <h3 className="text-[11px] font-medium tracking-[0.01em] text-foreground/55">{title}</h3>
      {description ? (
        <p className="mt-0.5 text-[11px] leading-[1.4] tracking-[0.005em] text-muted-foreground/75">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function StudioTextAddPanel({
  onAddStyle,
  baseStyle = DEFAULT_LAYER_STYLE,
  emptyState,
  tip,
  embedded = false,
  showPanelHeader,
  headerTitle = 'Text',
  headerDescription = 'Add a text box or start from a preset',
}: {
  onAddStyle: (style: TextLayerStyle) => void
  baseStyle?: TextLayerStyle
  emptyState?: ReactNode
  tip?: ReactNode
  embedded?: boolean
  showPanelHeader?: boolean
  headerTitle?: string
  headerDescription?: string
}) {
  const panelHeaderVisible = showPanelHeader ?? embedded
  const groups = useMemo(() => groupStudioTextPresets(TEXT_PRESETS), [])
  const quickPreviewBase = useMemo(
    () => mergeTextPreset(baseStyle, DEFAULT_NEW_TEXT_PRESET.style),
    [baseStyle],
  )

  const handleAddBlank = () => {
    onAddStyle(mergeTextPreset(baseStyle, DEFAULT_NEW_TEXT_PRESET.style))
  }

  const handleQuickAdd = (style: (typeof STUDIO_TEXT_QUICK_ADDS)[number]['style']) => {
    onAddStyle(mergeTextPreset(baseStyle, { ...DEFAULT_NEW_TEXT_PRESET.style, ...style }))
  }

  const handleAddPreset = (preset: TextPreset) => {
    onAddStyle(mergeTextPreset(baseStyle, preset.style))
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {panelHeaderVisible ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-3">
          <EditorPanelHeader title={headerTitle} description={headerDescription} />
        </div>
      ) : null}
      <EditorPanelScrollArea contentClassName="gap-6 p-3.5 pb-6">
        {emptyState ? (
          emptyState
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <Button
                size="sm"
                className={cn(
                  'h-9 w-full gap-2 rounded-[10px] text-[12.5px] font-medium tracking-[-0.01em]',
                  'shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-[transform,box-shadow,background-color] duration-150',
                  'hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] active:scale-[0.985]',
                )}
                onClick={handleAddBlank}
              >
                <PlusIcon className="size-3.5 opacity-90" strokeWidth={2.25} />
                Add text box
              </Button>

              <section className="flex flex-col gap-2">
                <SectionHeader title="Quick add" description="Common sizes, ready to place" />
                <div className="grid grid-cols-3 gap-1.5">
                  {STUDIO_TEXT_QUICK_ADDS.map(item => {
                    const previewStyle = buildTextLayerCss(
                      { ...quickPreviewBase, fontSize: item.previewSize, fontWeight: item.style.fontWeight },
                      0.42,
                    )
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleQuickAdd(item.style)}
                        className={cn(
                          'group flex flex-col items-stretch gap-1.5 rounded-[11px] border border-border/35 bg-muted/[0.08] p-1 text-left',
                          'transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out',
                          'hover:border-border/60 hover:bg-muted/20 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
                          'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                        )}
                      >
                        <span
                          className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-[8px] bg-neutral-950"
                          aria-hidden
                        >
                          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
                          <span
                            className="relative leading-none text-white"
                            style={previewStyle}
                          >
                            {item.sample}
                          </span>
                        </span>
                        <span className="px-0.5 pb-0.5 text-center text-[11px] font-medium tracking-[-0.01em] text-foreground/90">
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>

            {groups.map(group => (
              <section key={group.id} className="flex flex-col gap-2.5">
                <SectionHeader title={group.label} />
                <div className="grid grid-cols-2 gap-2">
                  {group.presets.map(preset => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      baseStyle={baseStyle}
                      onClick={() => handleAddPreset(preset)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {tip ? <div className="pt-0.5">{tip}</div> : null}
          </>
        )}
      </EditorPanelScrollArea>
    </div>
  )
}

export function StudioTextNoTargetEmpty({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return <EditorEmptyState title={title} description={description} />
}

export function StudioTextPanelTip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[11px] border border-border/35 bg-muted/[0.12] px-3 py-2.5">
      <p className="text-[11px] leading-[1.45] tracking-[0.005em] text-muted-foreground">{children}</p>
    </div>
  )
}

function PresetCard({
  preset,
  baseStyle,
  onClick,
}: {
  preset: TextPreset
  baseStyle: TextLayerStyle
  onClick: () => void
}) {
  const previewStyle = useMemo(() => {
    const merged = mergeTextPreset(baseStyle, { ...preset.style, fontSize: 48 })
    return buildTextLayerCss(merged, PREVIEW_SCALE)
  }, [baseStyle, preset.style])

  const hasBox = Boolean(preset.style.backgroundColor)
  const swatch = preset.style.backgroundColor || 'transparent'
  const label = preset.label.replace(/^TikTok\s+/i, '')

  return (
    <button
      type="button"
      onClick={onClick}
      title={preset.label}
      className={cn(
        'group flex flex-col items-stretch gap-1.5 rounded-[11px] border border-border/35 bg-muted/[0.06] p-1 text-left',
        'transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out',
        'hover:border-border/60 hover:bg-muted/18 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        'active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
      )}
    >
      <span
        className={cn(
          'relative flex h-[3.75rem] w-full items-center justify-center overflow-hidden rounded-[8px]',
          hasBox ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-neutral-950',
        )}
        style={hasBox ? { backgroundColor: swatch } : undefined}
        aria-hidden
      >
        {!hasBox ? (
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.13),transparent_52%)]" />
        ) : (
          <span className="absolute inset-0 bg-black/[0.04] dark:bg-black/15" />
        )}
        <span className="relative text-[13px] font-bold leading-none" style={previewStyle}>
          Aa
        </span>
      </span>
      <span className="truncate px-1 pb-0.5 text-[11px] font-medium tracking-[-0.01em] text-foreground/85">
        {label}
      </span>
    </button>
  )
}
