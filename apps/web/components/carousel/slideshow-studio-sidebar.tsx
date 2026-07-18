'use client'

import { EditorInspector } from '@/components/carousel/editor-inspector'
import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { StudioSegmentedTabs } from '@/components/carousel/studio-segmented-tabs'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type SidebarTab, useSidebarTab } from '@/hooks/carousel/use-sidebar-tab'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, LayersIcon, SparklesIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const PANEL_OPEN_STORAGE_KEY = 'slideshow-panel-open'

const SIDEBAR_TABS = [
  { id: 'generate' as const, label: 'Generate', icon: SparklesIcon },
  { id: 'edit' as const, label: 'Edit', icon: LayersIcon },
]

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
          className={cn(
            'relative flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[11px] font-medium transition-colors duration-150',
            active
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted/25 hover:text-foreground',
          )}
        >
          <Icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
          <span className="leading-none">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
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
        id={panelId ? `${panelId}-generate` : undefined}
        role="tabpanel"
        aria-labelledby={panelId ? `${panelId}-tab-generate` : undefined}
        hidden={tab !== 'generate'}
        className={cn('h-full min-h-0', tab !== 'generate' && 'hidden')}
        aria-hidden={tab !== 'generate'}
      >
        <SlideshowSourcePanel embedded showPanelHeader={showPanelHeader} />
      </div>
      <div
        id={panelId ? `${panelId}-edit` : undefined}
        role="tabpanel"
        aria-labelledby={panelId ? `${panelId}-tab-edit` : undefined}
        hidden={tab !== 'edit'}
        className={cn('h-full min-h-0', tab !== 'edit' && 'hidden')}
        aria-hidden={tab !== 'edit'}
      >
        <EditorInspector embedded showPanelHeader={showPanelHeader} />
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

  return (
    <div className={cn('relative flex h-full min-h-0 min-w-0 shrink-0 overflow-hidden bg-background', className)}>
      <nav
        aria-label="Slideshow editor panels"
        className="slideshow-editor-rail flex h-full w-14 shrink-0 flex-col gap-0.5 border-r border-border/60 px-1.5 py-2"
      >
        <RailButton
          active={tab === 'generate'}
          label="Generate"
          icon={SparklesIcon}
          onClick={() => {
            setTab('generate')
            if (!panelOpen) togglePanel()
          }}
        />
        <RailButton
          active={tab === 'edit'}
          label="Edit"
          icon={LayersIcon}
          onClick={() => {
            setTab('edit')
            if (!panelOpen) togglePanel()
          }}
        />
      </nav>

      <div
        className={cn(
          'slideshow-editor-panel relative flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r border-border/60 transition-[width,opacity] duration-200 ease-out',
          panelOpen ? 'w-60 opacity-100 lg:w-64 xl:w-[280px]' : 'w-0 border-r-0 opacity-0',
        )}
        aria-hidden={!panelOpen}
        inert={!panelOpen ? true : undefined}
      >
        <div
          className={cn(
            'flex h-full min-h-0 w-60 flex-col bg-background lg:w-64 xl:w-[280px]',
            !panelOpen && 'invisible',
          )}
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
              className="slideshow-editor-panel-toggle absolute top-1/2 -right-3 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-muted/40"
            >
              {panelOpen ? (
                <ChevronLeftIcon className="size-3.5 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="size-3.5 text-muted-foreground" />
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
              className="slideshow-editor-panel-toggle absolute top-1/2 left-[3.5rem] z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-muted/40"
            >
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: SidebarTab
}) {
  const { tab, setTab } = useSidebarTab()

  useEffect(() => {
    if (open && initialTab) setTab(initialTab)
  }, [initialTab, open, setTab])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[min(70vh,640px)] max-h-[min(70vh,640px)] gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="shrink-0 space-y-2.5 border-b border-border/60 px-3 py-3 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-[13px] font-medium tracking-tight">
                {tab === 'generate' ? 'Generate' : 'Edit'}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-[11px] leading-relaxed">
                {tab === 'generate'
                  ? 'Create slides with AI or import from TikTok'
                  : 'Background, layers, text, and images'}
              </SheetDescription>
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-9 shrink-0"
              onClick={() => onOpenChange(false)}
              aria-label="Close panel"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          <StudioSegmentedTabs tabs={SIDEBAR_TABS} value={tab} onChange={setTab} size="sm" />
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          <StudioPanelContent tab={tab} showPanelHeader={false} panelId="mobile-studio" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
