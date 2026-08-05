'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, TypeIcon } from 'lucide-react'
import { VideoSourcePanel } from '@/components/video/video-source-panel'
import { VideoTextPanel } from '@/components/video/video-text-panel'
import { VIDEO_OPEN_MEDIA_EVENT } from '@/lib/video/editor-events'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const PANEL_OPEN_STORAGE_KEY = 'video-panel-open'
const PANEL_TAB_STORAGE_KEY = 'video-panel-tab'
const PANEL_EASE = 'cubic-bezier(0.32,0.72,0,1)'

export type VideoSidebarTab = 'media' | 'text'

const SIDEBAR_TABS = [
  { id: 'media' as const, label: 'Media', icon: ImageIcon },
  { id: 'text' as const, label: 'Text', icon: TypeIcon },
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

function readPanelTab(): VideoSidebarTab {
  if (typeof window === 'undefined') return 'media'
  try {
    const stored = sessionStorage.getItem(PANEL_TAB_STORAGE_KEY)
    return stored === 'text' ? 'text' : 'media'
  } catch {
    return 'media'
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
  icon: typeof ImageIcon
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
          data-tour-anchor={label === 'Media' ? 'media' : undefined}
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

function VideoPanelContent({
  tab,
  showPanelHeader = true,
  panelId,
}: {
  tab: VideoSidebarTab
  showPanelHeader?: boolean
  panelId?: string
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div
        id={panelId ? `${panelId}-media` : undefined}
        role="tabpanel"
        hidden={tab !== 'media'}
        className={cn('h-full min-h-0', tab !== 'media' && 'hidden')}
        aria-hidden={tab !== 'media'}
      >
        <VideoSourcePanel embedded showPanelHeader={showPanelHeader} />
      </div>
      <div
        id={panelId ? `${panelId}-text` : undefined}
        role="tabpanel"
        hidden={tab !== 'text'}
        className={cn('h-full min-h-0', tab !== 'text' && 'hidden')}
        aria-hidden={tab !== 'text'}
      >
        <VideoTextPanel embedded showPanelHeader={showPanelHeader} />
      </div>
    </div>
  )
}

/** Left source rail — Media + Text (inspector lives on the right). */
export function VideoStudioSidebar({ className }: { className?: string }) {
  const [panelOpen, setPanelOpen] = useState(() => readPanelOpen())
  const [tab, setTab] = useState<VideoSidebarTab>(() => readPanelTab())

  const setOpen = useCallback((next: boolean) => {
    setPanelOpen(next)
    try {
      sessionStorage.setItem(PANEL_OPEN_STORAGE_KEY, String(next))
    } catch {
      // ignore storage errors
    }
  }, [])

  const selectTab = useCallback(
    (next: VideoSidebarTab) => {
      setTab(next)
      try {
        sessionStorage.setItem(PANEL_TAB_STORAGE_KEY, next)
      } catch {
        // ignore storage errors
      }
      if (!panelOpen) setOpen(true)
    },
    [panelOpen, setOpen],
  )

  const togglePanel = useCallback(() => {
    setOpen(!panelOpen)
  }, [panelOpen, setOpen])

  useEffect(() => {
    const open = () => {
      selectTab('media')
      setOpen(true)
    }
    window.addEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
    return () => window.removeEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
  }, [selectTab, setOpen])

  return (
    <div className={cn('relative flex h-full min-h-0 min-w-0 shrink-0 bg-background', className)}>
      <nav
        aria-label="Video editor panels"
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
          'relative flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r border-border/40 transition-[width,opacity] duration-300',
          panelOpen ? 'w-60 opacity-100 lg:w-64 xl:w-70' : 'w-0 border-r-0 opacity-0',
        )}
        aria-hidden={!panelOpen}
        inert={!panelOpen ? true : undefined}
      >
        <div
          className={cn('flex h-full min-h-0 w-60 flex-col bg-background lg:w-64 xl:w-70', !panelOpen && 'invisible')}
        >
          <VideoPanelContent tab={tab} panelId="desktop-video" />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={togglePanel}
              aria-expanded={panelOpen}
              aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
              className="video-editor-panel-toggle absolute top-1/2 -right-2.5 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-150 hover:border-border hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
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
              className="video-editor-panel-toggle absolute top-1/2 left-12 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-150 hover:border-border hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
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

export function VideoStudioMobileSourcePanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<VideoSidebarTab>(() => readPanelTab())

  const selectTab = useCallback((next: VideoSidebarTab) => {
    setTab(next)
    try {
      sessionStorage.setItem(PANEL_TAB_STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    const open = () => selectTab('media')
    window.addEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
    return () => window.removeEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
  }, [selectTab])

  return (
    <aside
      className={cn(
        'studio-source-panel flex max-h-[min(280px,32vh)] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b bg-background',
        className,
      )}
    >
      <div className="shrink-0 border-b border-border/40 px-3 py-2">
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
                onClick={() => selectTab(item.id)}
                className={cn(
                  'flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] transition-all duration-200',
                  active
                    ? 'bg-background font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'font-normal text-muted-foreground/70 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" strokeWidth={active ? 2.1 : 1.6} />
                <span className="leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <VideoPanelContent tab={tab} showPanelHeader={false} panelId="mobile-video" />
      </div>
    </aside>
  )
}
