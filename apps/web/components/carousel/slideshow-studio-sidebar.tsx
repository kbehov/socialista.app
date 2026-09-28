'use client'

import { EditorInspector } from '@/components/carousel/editor-inspector'
import { LayerList } from '@/components/carousel/layer-list'
import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { StudioDesignPanel } from '@/components/carousel/studio-design-panel'
import { StudioMediaPanel } from '@/components/carousel/studio-media-panel'
import { StudioPanelHeader, StudioPanelScrollArea } from '@/components/carousel/studio-segmented-tabs'
import { StudioTextPanel } from '@/components/carousel/studio-text-panel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type SidebarTab, useSidebarTab } from '@/hooks/carousel/use-sidebar-tab'
import { cn } from '@/lib/utils'
import { ImageIcon, LayersIcon, PaletteIcon, SquarePenIcon, TypeIcon, XIcon, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const PANEL_OPEN_STORAGE_KEY = 'slideshow-panel-open'

const SIDEBAR_TABS = [
  { id: 'create' as const, label: 'Create', icon: SquarePenIcon },
  { id: 'design' as const, label: 'Design', icon: PaletteIcon },
  { id: 'text' as const, label: 'Text', icon: TypeIcon },
  { id: 'media' as const, label: 'Media', icon: ImageIcon },
  { id: 'layers' as const, label: 'Layers', icon: LayersIcon },
]

const TAB_META: Record<SidebarTab, { title: string }> = {
  create: { title: 'Create' },
  design: { title: 'Design' },
  text: { title: 'Text' },
  media: { title: 'Media' },
  layers: { title: 'Layers' },
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

function persistPanelOpen(open: boolean) {
  try {
    sessionStorage.setItem(PANEL_OPEN_STORAGE_KEY, String(open))
  } catch {
    // ignore storage errors
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
  icon: LucideIcon
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
          className="group flex w-full justify-center rounded-md py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-[10px] transition-[transform,background-color,color] duration-150 ease-out motion-reduce:transition-none motion-reduce:active:scale-100 group-active:scale-[0.96]',
              active
                ? 'bg-foreground/[0.08] text-foreground'
                : 'text-muted-foreground group-hover:bg-foreground/[0.05] group-hover:text-foreground',
            )}
          >
            <Icon className="size-[17px]" strokeWidth={active ? 1.85 : 1.55} />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  )
}

function StudioLayersPanel({ embedded = false, showPanelHeader }: { embedded?: boolean; showPanelHeader?: boolean }) {
  const panelHeaderVisible = showPanelHeader ?? embedded

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {panelHeaderVisible ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
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

  const setPanelOpenPersisted = useCallback((next: boolean) => {
    setPanelOpen(next)
    persistPanelOpen(next)
  }, [])

  const handleRailClick = useCallback(
    (next: SidebarTab) => {
      if (tab === next && panelOpen) {
        setPanelOpenPersisted(false)
        return
      }
      setTab(next)
      if (!panelOpen) {
        setPanelOpenPersisted(true)
      }
    },
    [panelOpen, setPanelOpenPersisted, setTab, tab],
  )

  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 min-w-0 shrink-0 border-r border-border/40 bg-background',
        className,
      )}
    >
      <nav
        aria-label="Slideshow editor panels"
        className="slideshow-editor-rail flex h-full w-[52px] shrink-0 flex-col gap-1 px-1.5 py-3"
      >
        {SIDEBAR_TABS.map(item => (
          <RailButton
            key={item.id}
            active={tab === item.id}
            label={item.label}
            icon={item.icon}
            onClick={() => handleRailClick(item.id)}
          />
        ))}
      </nav>

      <div
        className={cn(
          'relative flex h-full min-w-0 shrink-0 flex-col overflow-hidden bg-background',
          panelOpen ? 'w-60 lg:w-64 xl:w-70' : 'w-0',
        )}
        aria-hidden={!panelOpen}
        inert={!panelOpen ? true : undefined}
      >
        <div
          className={cn(
            'flex h-full min-h-0 w-60 flex-col transition-opacity duration-150 lg:w-64 xl:w-70',
            panelOpen ? 'opacity-100' : 'pointer-events-none invisible opacity-0',
          )}
        >
          <StudioPanelContent tab={tab} panelId="desktop-studio" />
        </div>
      </div>
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

  const meta = showInspector ? { title: 'Inspector' } : TAB_META[tab]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[min(72vh,680px)] max-h-[min(72vh,680px)] gap-0 rounded-t-2xl p-0 shadow-none"
      >
        <div className="flex shrink-0 justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
        </div>

        <SheetHeader className="shrink-0 space-y-3 border-b border-border/40 px-4 pt-1 pb-3 text-left">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-[13px] font-medium tracking-tight">{meta.title}</SheetTitle>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
              onClick={() => onOpenChange(false)}
              aria-label="Close panel"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          {!showInspector ? (
            <div className="flex gap-0.5 rounded-lg bg-foreground/[0.04] p-0.5" role="tablist" aria-label="Studio panels">
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
                      'flex h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[11px] font-medium transition-colors duration-150',
                      active
                        ? 'bg-background text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={1.75} />
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
