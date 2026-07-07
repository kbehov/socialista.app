'use client'

import { EditorInspector } from '@/components/carousel/editor-inspector'
import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { StudioPanelHeader, StudioSegmentedTabs } from '@/components/carousel/studio-segmented-tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type SidebarTab, useSidebarTab } from '@/hooks/carousel/use-sidebar-tab'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, LayersIcon, SparklesIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

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
            'relative flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium transition-colors duration-150',
            active ? 'bg-muted/40 text-foreground' : 'text-muted-foreground hover:bg-muted/25 hover:text-foreground',
          )}
        >
          {active ? (
            <span
              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
              aria-hidden
            />
          ) : null}
          <Icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
          <span className="leading-none">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function StudioPanelContent({ tab, showPanelHeader = true }: { tab: SidebarTab; showPanelHeader?: boolean }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className={cn('h-full min-h-0', tab !== 'generate' && 'hidden')} aria-hidden={tab !== 'generate'}>
        <SlideshowSourcePanel embedded showPanelHeader={showPanelHeader} />
      </div>
      <div className={cn('h-full min-h-0', tab !== 'edit' && 'hidden')} aria-hidden={tab !== 'edit'}>
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
        className="slideshow-editor-rail flex h-full w-[52px] shrink-0 flex-col gap-0.5 border-r border-border/60 px-1.5 py-2"
      >
        <RailButton
          active={tab === 'generate'}
          label="Generate"
          icon={SparklesIcon}
          onClick={() => setTab('generate')}
        />
        <RailButton active={tab === 'edit'} label="Edit" icon={LayersIcon} onClick={() => setTab('edit')} />
      </nav>

      <div
        className={cn(
          'slideshow-editor-panel relative flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r border-border/60 transition-[width,opacity] duration-200 ease-out',
          panelOpen ? 'w-60 opacity-100 lg:w-64 xl:w-[280px]' : 'w-0 border-r-0 opacity-0',
        )}
        aria-hidden={!panelOpen}
      >
        <div
          className={cn(
            'flex h-full min-h-0 w-60 flex-col bg-background lg:w-64 xl:w-[280px]',
            !panelOpen && 'invisible',
          )}
        >
          <StudioPanelContent tab={tab} />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={togglePanel}
              aria-expanded={panelOpen}
              aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
              className="slideshow-editor-panel-toggle absolute top-1/2 -right-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-muted/40"
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
              className="slideshow-editor-panel-toggle absolute top-1/2 left-[3.125rem] z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-muted/40"
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

export function SlideshowStudioMobilePanel({ className }: { className?: string }) {
  const { tab, setTab } = useSidebarTab()

  return (
    <aside
      className={cn(
        'studio-source-panel flex max-h-[min(280px,32vh)] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-border/60 bg-background',
        className,
      )}
    >
      <div className="shrink-0 space-y-2.5 border-b border-border/60 px-3 py-2.5">
        <StudioPanelHeader
          title={tab === 'generate' ? 'Generate' : 'Edit'}
          description={
            tab === 'generate' ? 'Create slides with AI or import from TikTok' : 'Background, layers, text, and images'
          }
        />
        <StudioSegmentedTabs tabs={SIDEBAR_TABS} value={tab} onChange={setTab} size="sm" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-background">
        <StudioPanelContent tab={tab} showPanelHeader={false} />
      </div>
    </aside>
  )
}
