'use client'

import { EditorInspector } from '@/components/carousel/editor-inspector'
import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { type SidebarTab, useSidebarTab } from '@/hooks/carousel/use-sidebar-tab'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeftIcon, ChevronRightIcon, LayersIcon, SparklesIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

const PANEL_OPEN_STORAGE_KEY = 'slideshow-panel-open'

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
            'flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium transition-colors',
            active
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
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

function StudioPanelContent({ tab }: { tab: SidebarTab }) {
  return (
    <div className="relative h-full min-h-0">
      <div className={cn('h-full min-h-0', tab !== 'generate' && 'hidden')} aria-hidden={tab !== 'generate'}>
        <SlideshowSourcePanel embedded />
      </div>
      <div className={cn('h-full min-h-0', tab !== 'edit' && 'hidden')} aria-hidden={tab !== 'edit'}>
        <EditorInspector embedded />
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
    <div className={cn('relative flex h-full min-h-0 min-w-0 shrink-0', className)}>
      <nav
        aria-label="Slideshow editor panels"
        className="slideshow-editor-rail video-editor-rail flex w-14 shrink-0 flex-col gap-1 border-r px-1.5 py-2"
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
          'slideshow-editor-panel video-editor-panel relative flex min-w-0 shrink-0 flex-col overflow-hidden border-r transition-[width,opacity] duration-200 ease-out',
          panelOpen ? 'w-60 opacity-100 lg:w-64 xl:w-[280px]' : 'w-0 border-r-0 opacity-0',
        )}
        aria-hidden={!panelOpen}
      >
        <div className={cn('flex h-full min-h-0 w-60 flex-col lg:w-64 xl:w-[280px]', !panelOpen && 'invisible')}>
          <StudioPanelContent tab={tab} />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={togglePanel}
              aria-expanded={panelOpen}
              aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
              className="slideshow-editor-panel-toggle absolute top-1/2 -right-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted"
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
              className="slideshow-editor-panel-toggle absolute top-1/2 left-[3.25rem] z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted"
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

const MOBILE_TABS: { id: SidebarTab; label: string; icon: typeof SparklesIcon }[] = [
  { id: 'generate', label: 'Generate', icon: SparklesIcon },
  { id: 'edit', label: 'Edit', icon: LayersIcon },
]

export function SlideshowStudioMobilePanel({ className }: { className?: string }) {
  const { tab, setTab } = useSidebarTab()

  return (
    <aside
      className={cn(
        'studio-source-panel flex max-h-[min(280px,32vh)] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b',
        className,
      )}
    >
      <div className="shrink-0 border-b px-2 py-1.5">
        <div className="flex gap-0.5 rounded-md border border-border/50 bg-muted/30 p-0.5">
          {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={cn(
                'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-sm text-[11px] font-medium transition-colors',
                tab === id
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <StudioPanelContent tab={tab} />
      </div>
    </aside>
  )
}
