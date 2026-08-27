'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, SparklesIcon, TypeIcon, XIcon } from 'lucide-react'
import { VideoSourcePanel } from '@/components/video/video-source-panel'
import { VideoScriptPanel } from '@/components/video/video-script-panel'
import { VideoTextPanel } from '@/components/video/video-text-panel'
import { VIDEO_OPEN_MEDIA_EVENT, type VideoStudioPanelTab } from '@/lib/video/editor-events'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const PANEL_OPEN_STORAGE_KEY = 'video-panel-open'
const PANEL_TAB_STORAGE_KEY = 'video-panel-tab'
const PANEL_EASE = 'cubic-bezier(0.32,0.72,0,1)'

export type VideoSidebarTab = VideoStudioPanelTab

const SIDEBAR_TABS = [
  { id: 'media' as const, label: 'Media', icon: ImageIcon },
  { id: 'text' as const, label: 'Text', icon: TypeIcon },
  { id: 'script' as const, label: 'Script', icon: SparklesIcon },
]

const TAB_META: Record<VideoSidebarTab, { title: string; description: string }> = {
  media: { title: 'Media', description: 'Upload, library, Pixabay, or paste a URL' },
  text: { title: 'Text', description: 'Add text boxes and presets at the playhead' },
  script: { title: 'Script', description: 'Generate timed on-screen captions' },
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

function readPanelTab(): VideoSidebarTab {
  if (typeof window === 'undefined') return 'media'
  try {
    const stored = sessionStorage.getItem(PANEL_TAB_STORAGE_KEY)
    if (stored === 'text' || stored === 'script' || stored === 'media') return stored
    return 'media'
  } catch {
    return 'media'
  }
}

function parsePanelTab(detail: unknown): VideoSidebarTab {
  if (detail === 'text' || detail === 'script' || detail === 'media') return detail
  return 'media'
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
          className="group flex w-full flex-col items-center gap-1 rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg transition-colors duration-150',
              active
                ? 'bg-foreground/[0.07] text-foreground'
                : 'text-muted-foreground group-hover:bg-foreground/[0.04] group-hover:text-foreground',
            )}
          >
            <Icon className="size-4" strokeWidth={active ? 1.9 : 1.6} />
          </span>
          <span
            className={cn(
              'text-[10px] leading-none tracking-tight transition-colors duration-150',
              active
                ? 'font-medium text-foreground'
                : 'font-medium text-muted-foreground group-hover:text-foreground',
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
      <div
        id={panelId ? `${panelId}-script` : undefined}
        role="tabpanel"
        hidden={tab !== 'script'}
        className={cn('h-full min-h-0', tab !== 'script' && 'hidden')}
        aria-hidden={tab !== 'script'}
      >
        <VideoScriptPanel embedded showPanelHeader={showPanelHeader} />
      </div>
    </div>
  )
}

/** Left source rail — Media + Text + Script (inspector lives on the right). */
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
    const open = (event: Event) => {
      const next = parsePanelTab((event as CustomEvent).detail)
      selectTab(next)
      setOpen(true)
    }
    window.addEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
    return () => window.removeEventListener(VIDEO_OPEN_MEDIA_EVENT, open)
  }, [selectTab, setOpen])

  return (
    <div className={cn('relative flex h-full min-h-0 min-w-0 shrink-0 bg-background', className)}>
      <nav
        aria-label="Video editor panels"
        className="flex h-full w-12 shrink-0 flex-col gap-0.5 border-r border-border/40 px-1 py-2"
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
              className="video-editor-panel-toggle absolute top-1/2 -right-2.5 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background transition-colors duration-150 hover:border-border hover:bg-muted"
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
              className="video-editor-panel-toggle absolute top-1/2 left-12 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background transition-colors duration-150 hover:border-border hover:bg-muted"
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

export function VideoStudioMobileSheet() {
  const [open, setOpen] = useState(false)
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
    const openPanel = (event: Event) => {
      const isDesktop =
        typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
      if (isDesktop) return
      selectTab(parsePanelTab((event as CustomEvent).detail))
      setOpen(true)
    }
    window.addEventListener(VIDEO_OPEN_MEDIA_EVENT, openPanel)
    return () => window.removeEventListener(VIDEO_OPEN_MEDIA_EVENT, openPanel)
  }, [selectTab])

  const meta = TAB_META[tab]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[min(72vh,680px)] max-h-[min(72vh,680px)] gap-0 rounded-t-2xl p-0 shadow-none lg:hidden"
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
              onClick={() => setOpen(false)}
              aria-label="Close panel"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
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
                  onClick={() => selectTab(item.id)}
                  className={cn(
                    'flex h-9 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[10px] font-medium transition-colors duration-150',
                    active
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={active ? 1.9 : 1.6} />
                  <span className="leading-none">{item.label}</span>
                </button>
              )
            })}
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          <VideoPanelContent tab={tab} showPanelHeader={false} panelId="mobile-video" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
