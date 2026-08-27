'use client'

import { SlideBackgroundPanel } from '@/components/carousel/slide-background-panel'
import {
  StudioEmptyState,
  StudioPanelHeader,
  StudioPanelScrollArea,
  StudioPanelSection,
} from '@/components/carousel/studio-segmented-tabs'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/carousel/store'
import { overlayFillColor } from '@/lib/carousel/overlay-style'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'

const OVERLAY_PRESETS = [
  { id: 'dark-40', label: 'Dark', detail: '40%', color: '#000000', opacity: 0.4 },
  { id: 'dark-60', label: 'Dark', detail: '60%', color: '#000000', opacity: 0.6 },
  { id: 'light-25', label: 'Light', detail: '25%', color: '#ffffff', opacity: 0.25 },
] as const

export function StudioDesignPanel({
  embedded = false,
  showPanelHeader,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const panelHeaderVisible = showPanelHeader ?? embedded
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const addOverlayLayer = useEditorStore(s => s.addOverlayLayer)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {panelHeaderVisible ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
          <StudioPanelHeader title="Design" description="Background color, photo, and overlays" />
        </div>
      ) : null}
      <StudioPanelScrollArea>
        {!activeSlideId ? (
          <StudioEmptyState
            title="No slide selected"
            description="Select a slide on the canvas to edit its design."
          />
        ) : (
          <>
            <StudioPanelSection title="Background">
              <SlideBackgroundPanel compact />
            </StudioPanelSection>

            <StudioPanelSection
              title="Overlay"
              description="Tint the slide so text stays readable over photos."
            >
              <div className="grid grid-cols-3 gap-1.5">
                {OVERLAY_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      addOverlayLayer(activeSlideId, { color: preset.color, opacity: preset.opacity })
                    }
                    className={cn(
                      'group flex flex-col items-center gap-2 rounded-lg px-1.5 py-2',
                      'transition-colors duration-150',
                      'hover:bg-foreground/[0.04] active:scale-[0.98]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    )}
                  >
                    <span
                      className="relative size-9 overflow-hidden rounded-md ring-1 ring-border/60"
                      aria-hidden
                    >
                      <span className="absolute inset-0 bg-[linear-gradient(135deg,#c4c4c4_0%,#525252_50%,#171717_100%)]" />
                      <span
                        className="absolute inset-0"
                        style={{ backgroundColor: overlayFillColor(preset.color, preset.opacity) }}
                      />
                    </span>
                    <span className="text-center leading-none">
                      <span className="block text-[11px] font-medium tracking-tight text-foreground">
                        {preset.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{preset.detail}</span>
                    </span>
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                variant="outline"
                className="h-8 w-full gap-1.5 rounded-lg text-[12px] font-medium tracking-tight"
                onClick={() => addOverlayLayer(activeSlideId)}
              >
                <PlusIcon className="size-3.5" strokeWidth={2} />
                Custom overlay
              </Button>
            </StudioPanelSection>
          </>
        )}
      </StudioPanelScrollArea>
    </div>
  )
}
