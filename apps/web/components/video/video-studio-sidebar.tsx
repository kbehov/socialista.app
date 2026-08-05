'use client'

import { useCallback, useEffect, useState } from 'react'
import { FolderOpenIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { VideoSourcePanel } from '@/components/video/video-source-panel'
import { VIDEO_OPEN_MEDIA_EVENT } from '@/lib/video/editor-events'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const PANEL_OPEN_STORAGE_KEY = 'video-panel-open'

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
  icon: typeof FolderOpenIcon
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
          data-tour-anchor="media"
          className={cn(
            'video-studio-press flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium transition-colors',
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

/** Left source rail — Media only (inspector lives on the right). */
export function VideoStudioSidebar({ className }: { className?: string }) {
  const [panelOpen, setPanelOpen] = useState(() => readPanelOpen())

  const setOpen = useCallback((next: boolean) => {
    setPanelOpen(next)
    try {
      sessionStorage.setItem(PANEL_OPEN_STORAGE_KEY, String(next))
    } catch {
      // ignore storage errors
    }
  }, [])

  const togglePanel = useCallback(() => {
    setOpen(!panelOpen)
  }, [panelOpen, setOpen])

  useEffect(() => {
    const open = () => setOpen(true)
    window.addEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
    return () => window.removeEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
  }, [setOpen])

  return (
    <div className={cn('relative flex h-full min-h-0 min-w-0 shrink-0 bg-background', className)}>
      <nav
        aria-label="Editor panels"
        className="video-editor-rail flex w-14 shrink-0 flex-col gap-1 border-r border-border/40 bg-background px-1.5 py-2"
      >
        <RailButton
          active
          label="Media"
          icon={FolderOpenIcon}
          onClick={() => {
            if (!panelOpen) togglePanel()
          }}
        />
      </nav>

      <div
        className={cn(
          'video-editor-panel relative flex min-w-0 shrink-0 flex-col overflow-hidden border-r border-border/40 bg-background transition-[width,opacity] duration-200 ease-out',
          panelOpen ? 'w-60 opacity-100 lg:w-64 xl:w-[280px]' : 'w-0 border-r-0 opacity-0',
        )}
        aria-hidden={!panelOpen}
      >
        <div className={cn('flex h-full min-h-0 w-60 flex-col lg:w-64 xl:w-[280px]', !panelOpen && 'invisible')}>
          <VideoSourcePanel />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={togglePanel}
              aria-expanded={panelOpen}
              aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
              className="video-editor-panel-toggle video-studio-press absolute top-1/2 -right-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
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
              className="video-editor-panel-toggle video-studio-press absolute top-1/2 left-[3.25rem] z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
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
