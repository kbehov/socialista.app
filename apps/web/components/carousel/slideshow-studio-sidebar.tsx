'use client'

import { EditorInspector } from '@/components/carousel/editor-inspector'
import { LayerList } from '@/components/carousel/layer-list'
import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { StudioDesignPanel } from '@/components/carousel/studio-design-panel'
import { StudioMediaPanel } from '@/components/carousel/studio-media-panel'
import { StudioPanelHeader, StudioPanelScrollArea } from '@/components/carousel/studio-segmented-tabs'
import { StudioTextPanel } from '@/components/carousel/studio-text-panel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type SidebarTab, useSidebarTab } from '@/hooks/carousel/use-sidebar-tab'
import { cn } from '@/lib/utils'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  LayersIcon,
  PaletteIcon,
  SparklesIcon,
  TypeIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const PANEL_OPEN_STORAGE_KEY = 'slideshow-panel-open'
const PANEL_EASE = 'cubic-bezier(0.32,0.72,0,1)'

const SIDEBAR_TABS = [
  { id: 'create' as const, label: 'Create', icon: SparklesIcon },
  { id: 'design' as const, label: 'Design', icon: PaletteIcon },
  { id: 'text' as const, label: 'Text', icon: TypeIcon },
  { id: 'media' as const, label: 'Media', icon: ImageIcon },
  { id: 'layers' as const, label: 'Layers', icon: LayersIcon },
]

const TAB_META: Record<SidebarTab, { title: string; description: string }> = {
  create: { title: 'Create', description: 'Topic, directions, or import from TikTok' },
  design: { title: 'Design', description: 'Background, color, and overlays' },
  text: { title: 'Text', description: 'Add text boxes and presets' },
  media: { title: 'Media', description: 'Upload, files, Unsplash, or URL' },
  layers: { title: 'Layers', description: 'Reorder and manage slide layers' },
}

function readPanelOpen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const stored = sessionStorage.getItem(PANEL_OPEN_STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

function RailButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof SparklesIcon
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className="group flex w-full flex-col items-center gap-1 rounded-lg py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-[9px] transition-all duration-200',
              active
                ? 'bg-foreground/[0.07] text-foreground'
                : 'text-muted-foreground/80 group-hover:bg-foreground/[0.04] group-hover:text-foreground/70',
            )}
          >
            <Icon className="size-[15px]" strokeWidth={active ? 2.1 : 1.6} />
          </span>
          <span
            className={cn(
              'text-[10px] leading-none tracking-tight transition-colors duration-200',
              active
                ? 'font-medium text-foreground'
                : 'font-normal text-muted-foreground/60 group-hover:text-muted-foreground',
            )}
          >
            {label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function StudioLayersPanel({ embedded = false, showPanelHeader }: { embedded?: boolean; showPanelHeader?: boolean }) {
  const panelHeaderVisible = showPanelHeader ?? embedded

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {panelHeaderVisible ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-3">
          <StudioPanelHeader title="Layers" description="Reorder and manage slide layers" />
        </div>
      ) : null}
      <StudioPanelScrollArea>
        <LayerList forceVisible />
      </StudioPanelScrollArea>
    </div>
  )
}

function StudioPanelContent({
  tab,
  showPanelHeader = true,
  panelId,
}: {
  tab: SidebarTab
  showPanelHeader?: boolean
  panelId?: string
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div
        id={panelId ? `${panelId}-create` : undefined}
        role="tabpanel"
        hidden={tab !== 'create'}
        className={cn('h-full min-h-0', tab !== 'create' && 'hidden')}
        aria-hidden={tab !== 'create'}
      >
        <SlideshowSourcePanel embedded showPanelHeader={showPanelHeader} />
      </div>
      <div
        id={panelId ? `${panelId}-design` : undefined}
        role="tabpanel"
        hidden={tab !== 'design'}
        className={cn('h-full min-h-0', tab !== 'design' && 'hidden')}
        aria-hidden={tab !== 'design'}
      >
        <StudioDesignPanel embedded showPanelHeader={showPanelHeader} />
      </div>
      <div
        id={panelId ? `${panelId}-text` : undefined}
        role="tabpanel"
        hidden={tab !== 'text'}
        className={cn('h-full min-h-0', tab !== 'text' && 'hidden')}
        aria-hidden={tab !== 'text'}
      >
        <StudioTextPanel embedded showPanelHeader={showPanelHeader} />
      </div>
      <div
        id={panelId ? `${panelId}-media` : undefined}
        role="tabpanel"
        hidden={tab !== 'media'}
        className={cn('h-full min-h-0', tab !== 'media' && 'hidden')}
        aria-hidden={tab !== 'media'}
      >
        <StudioMediaPanel embedded showPanelHeader={showPanelHeader} />
      </div>
      <div
        id={panelId ? `${panelId}-layers` : undefined}
        role="tabpanel"
        hidden={tab !== 'layers'}
        className={cn('h-full min-h-0', tab !== 'layers' && 'hidden')}
        aria-hidden={tab !== 'layers'}
      >
        <StudioLayersPanel embedded showPanelHeader={showPanelHeader} />
      </div>
    </div>
  )
}

export function SlideshowStudioSidebar({ className }: { className?: string }) {
  const { tab, setTab } = useSidebarTab()
  const [panelOpen, setPanelOpen] = useState(() => readPanelOpen())

  const togglePanel = useCallback(() => {
    setPanelOpen(prev => {
      const next = !prev
      try {
        sessionStorage.setItem(PANEL_OPEN_STORAGE_KEY, String(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }, [])

  const selectTab = useCallback(
    (next: SidebarTab) => {
      setTab(next)
      if (!panelOpen) togglePanel()
    },
    [panelOpen, setTab, togglePanel],
  )

  return (
    <div className={cn('relative flex h-full min-h-0 min-w-0 shrink-0 bg-background', className)}>
      <nav
        aria-label="Slideshow editor panels"
        className="flex h-full w-12 shrink-0 flex-col gap-1 border-r border-border/40 px-1.5 py-2"
      >
        {SIDEBAR_TABS.map(item => (
          <RailButton
            key={item.id}
            active={tab === item.id}
            label={item.label}
            icon={item.icon}
            onClick={() => selectTab(item.id)}
          />
        ))}
      </nav>

      <div
        style={{ transitionTimingFunction: PANEL_EASE }}
        className={cn(
          ' relative flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r border-border/40 transition-[width,opacity] duration-300',
          panelOpen ? 'w-60 opacity-100 lg:w-64 xl:w-70' : 'w-0 border-r-0 opacity-0',
        )}
        aria-hidden={!panelOpen}
        inert={!panelOpen ? true : undefined}
      >
        <div
          className={cn('flex h-full min-h-0 w-60 flex-col bg-background lg:w-64 xl:w-70', !panelOpen && 'invisible')}
        >
          <StudioPanelContent tab={tab} panelId="desktop-studio" />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={togglePanel}
              aria-expanded={panelOpen}
              aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
              className="slideshow-editor-panel-toggle absolute top-1/2 -right-2.5 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-150 hover:border-border hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              {panelOpen ? (
                <ChevronLeftIcon className="size-3 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="size-3 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{panelOpen ? 'Collapse panel' : 'Expand panel'}</TooltipContent>
        </Tooltip>
      </div>

      {!panelOpen ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={togglePanel}
              aria-expanded={false}
              aria-label="Expand panel"
              className="slideshow-editor-panel-toggle absolute top-1/2 left-12 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-150 hover:border-border hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              <ChevronRightIcon className="size-3 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand panel</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}

export function SlideshowStudioMobileSheet({
  open,
  onOpenChange,
  initialTab,
  showInspector = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: SidebarTab
  showInspector?: boolean
}) {
  const { tab, setTab } = useSidebarTab()

  useEffect(() => {
    if (open && initialTab) setTab(initialTab)
  }, [initialTab, open, setTab])

  const meta = showInspector ? { title: 'Inspector', description: 'Edit the selected layer or slide' } : TAB_META[tab]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[min(72vh,680px)] max-h-[min(72vh,680px)] gap-0 rounded-t-[20px] p-0 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
      >
        <div className="flex shrink-0 justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
        </div>

        <SheetHeader className="shrink-0 space-y-3 border-b border-border/40 px-4 pt-1 pb-3.5 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-[13px] font-medium tracking-tight">{meta.title}</SheetTitle>
              <SheetDescription className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground/80">
                {meta.description}
              </SheetDescription>
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
              onClick={() => onOpenChange(false)}
              aria-label="Close panel"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          {!showInspector ? (
            <div className="flex gap-0.5 rounded-xl bg-foreground/[0.04] p-1" role="tablist" aria-label="Studio panels">
              {SIDEBAR_TABS.map(item => {
                const Icon = item.icon
                const active = tab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={item.label}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      'flex h-9 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] transition-all duration-200',
                      active
                        ? 'bg-background font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                        : 'font-normal text-muted-foreground/70 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-[15px]" strokeWidth={active ? 2.1 : 1.6} />
                    <span className="leading-none">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          {showInspector ? (
            <EditorInspector embedded showPanelHeader={false} />
          ) : (
            <StudioPanelContent tab={tab} showPanelHeader={false} panelId="mobile-studio" />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
