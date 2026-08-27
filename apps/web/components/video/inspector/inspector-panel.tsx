'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, TypeIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  EditorEmptyState,
  EditorPanelHeader,
  EditorPanelScrollArea,
} from '@/components/editor/panel-shell'
import { ClipProperties } from '@/components/video/inspector/clip-properties'
import { OverlayProperties } from '@/components/video/inspector/overlay-properties'
import { ProjectProperties } from '@/components/video/inspector/project-properties'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const INSPECTOR_OPEN_KEY = 'video-inspector-open'
const PANEL_EASE = 'cubic-bezier(0.32,0.72,0,1)'

function readInspectorOpen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const stored = sessionStorage.getItem(INSPECTOR_OPEN_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

function InspectorBody({ showPanelHeader = true }: { showPanelHeader?: boolean }) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const playhead = useVideoEditorStore(s => s.playhead)
  const duration = useVideoEditorStore(s => s.project.duration)
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)

  const mode = selectedClipId ? 'clip' : selectedOverlayId ? 'overlay' : 'project'

  const handleAddText = () => {
    const end = Math.min(duration > 0 ? duration : playhead + 3, playhead + 3)
    addTextOverlay(playhead, Math.max(playhead + 0.5, end))
  }

  const meta =
    mode === 'clip'
      ? { title: 'Clip', description: 'Timing, volume, filters, and transform' }
      : mode === 'overlay'
        ? { title: 'Text', description: 'Style the selected overlay' }
        : { title: 'Project', description: 'Format, frame rate, and duration' }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {showPanelHeader ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
          <EditorPanelHeader title={meta.title} description={meta.description} />
        </div>
      ) : null}
      <EditorPanelScrollArea key={mode} contentClassName="animate-in fade-in-0 duration-150">
        {mode === 'clip' && selectedClipId ? (
          <ClipProperties key={selectedClipId} clipId={selectedClipId} />
        ) : null}

        {mode === 'overlay' && selectedOverlayId ? (
          <OverlayProperties overlayId={selectedOverlayId} />
        ) : mode === 'overlay' ? (
          <EditorEmptyState
            title="No text overlay selected"
            description="Add a text layer at the playhead, or select one on the canvas or timeline."
          >
            <Button
              type="button"
              size="sm"
              className="mt-3 h-8 gap-1.5 text-[12px] font-medium"
              onClick={handleAddText}
            >
              <TypeIcon className="size-3.5" strokeWidth={1.75} />
              Add text
            </Button>
          </EditorEmptyState>
        ) : null}

        {mode === 'project' ? <ProjectProperties /> : null}
      </EditorPanelScrollArea>
    </div>
  )
}

export function VideoInspectorPanel({ className }: { className?: string }) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const [open, setOpen] = useState(() => readInspectorOpen())
  const [mobileOpen, setMobileOpen] = useState(false)
  const prevSelection = useRef<string | null>(null)

  const selectionKey = selectedClipId ?? selectedOverlayId

  useEffect(() => {
    if (selectionKey && selectionKey !== prevSelection.current) {
      setOpen(true)
      const isMobileViewport =
        typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
      if (isMobileViewport) setMobileOpen(true)
      try {
        sessionStorage.setItem(INSPECTOR_OPEN_KEY, 'true')
      } catch {
        // ignore
      }
    }
    prevSelection.current = selectionKey
  }, [selectionKey])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setMobileOpen(false)
    }
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    setOpen(prev => {
      const next = !prev
      try {
        sessionStorage.setItem(INSPECTOR_OPEN_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <>
      <div className={cn('relative hidden h-full min-h-0 shrink-0 lg:flex', className)}>
        <div
          style={{ transitionTimingFunction: PANEL_EASE }}
          className={cn(
            'flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-border/40 bg-background transition-[width,opacity] duration-300',
            open ? 'w-72 opacity-100 xl:w-80' : 'w-0 border-l-0 opacity-0',
          )}
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          <div className={cn('flex h-full w-72 min-w-72 flex-col xl:w-80 xl:min-w-80', !open && 'invisible')}>
            <InspectorBody />
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-label={open ? 'Collapse inspector' : 'Expand inspector'}
              className={cn(
                'video-editor-panel-toggle absolute top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background transition-colors duration-150 hover:border-border hover:bg-muted',
                open ? '-left-2.5' : '-left-6',
              )}
            >
              {open ? (
                <ChevronRightIcon className="size-3 text-muted-foreground" />
              ) : (
                <ChevronLeftIcon className="size-3 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">{open ? 'Collapse inspector' : 'Expand inspector'}</TooltipContent>
        </Tooltip>
      </div>

      <Sheet open={mobileOpen && Boolean(selectionKey)} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex h-[min(72vh,680px)] max-h-[min(72vh,680px)] gap-0 rounded-t-2xl p-0 shadow-none lg:hidden"
        >
          <div className="flex shrink-0 justify-center pt-2.5 pb-1">
            <span className="h-1 w-9 rounded-full bg-muted-foreground/25" aria-hidden />
          </div>
          <SheetHeader className="shrink-0 space-y-0 border-b border-border/40 px-4 pt-1 pb-3.5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="text-[13px] font-medium tracking-tight">Properties</SheetTitle>
                <SheetDescription className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground/80">
                  Edit the selected clip, overlay, or project.
                </SheetDescription>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Close inspector"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <InspectorBody showPanelHeader={false} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
