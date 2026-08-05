'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeftIcon, ChevronRightIcon, FilmIcon, SettingsIcon, TypeIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ClipProperties } from '@/components/video/inspector/clip-properties'
import { OverlayProperties } from '@/components/video/inspector/overlay-properties'
import { ProjectProperties } from '@/components/video/inspector/project-properties'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'

const INSPECTOR_OPEN_KEY = 'video-inspector-open'

function readInspectorOpen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const stored = sessionStorage.getItem(INSPECTOR_OPEN_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

function EmptyTabState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof TypeIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void; icon?: typeof TypeIcon }
}) {
  const ActionIcon = action?.icon
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/15 px-4 py-8 text-center">
      <Icon className="mx-auto size-5 text-muted-foreground/70" strokeWidth={1.5} />
      <p className="mt-2 text-[12px] font-medium tracking-tight text-foreground/80">{title}</p>
      <p className="mt-1 max-w-[18rem] text-[11px] leading-[1.45] text-muted-foreground">{description}</p>
      {action ? (
        <Button
          type="button"
          size="sm"
          className="video-studio-press mt-4 h-8 gap-1.5"
          onClick={action.onClick}
        >
          {ActionIcon ? <ActionIcon className="size-3.5" /> : null}
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}

function InspectorBody() {
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

  const title =
    mode === 'clip' ? 'Clip' : mode === 'overlay' ? 'Text' : 'Project'
  const TitleIcon = mode === 'clip' ? FilmIcon : mode === 'overlay' ? TypeIcon : SettingsIcon

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <TitleIcon className="size-3.5 text-muted-foreground" />
        <p className="text-[13px] font-semibold tracking-[-0.01em]">{title}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto sidebar-scrollbar">
        <div className="flex flex-col gap-3 p-3">
          {mode === 'clip' && selectedClipId ? (
            <ClipProperties key={selectedClipId} clipId={selectedClipId} />
          ) : null}

          {mode === 'overlay' && selectedOverlayId ? (
            <OverlayProperties overlayId={selectedOverlayId} />
          ) : mode === 'overlay' ? (
            <EmptyTabState
              icon={TypeIcon}
              title="No text overlay selected"
              description="Add a text layer at the playhead, or select one on the timeline or preview."
              action={{ label: 'Add text', onClick: handleAddText, icon: TypeIcon }}
            />
          ) : null}

          {mode === 'project' ? <ProjectProperties /> : null}
        </div>
      </div>
    </div>
  )
}

export function VideoInspectorPanel({ className }: { className?: string }) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const [open, setOpen] = useState(() => readInspectorOpen())
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const prevSelection = useRef<string | null>(null)

  const selectionKey = selectedClipId ?? selectedOverlayId

  useEffect(() => {
    if (selectionKey && selectionKey !== prevSelection.current) {
      setOpen(true)
      // Mobile sheet only — opening on desktop still mounts SheetOverlay and dims the UI
      // even when SheetContent is `lg:hidden`.
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

  // Close the mobile sheet if the viewport grows to desktop while it is open.
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
      {/* Desktop right rail */}
      <div className={cn('relative hidden h-full min-h-0 shrink-0 lg:flex', className)}>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.aside
              key="inspector"
              initial={reduceMotion ? { opacity: 0 } : { width: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { width: 280, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { width: 0, opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', bounce: 0, duration: 0.35 }
              }
              className="video-editor-inspector flex h-full min-h-0 w-[280px] flex-col overflow-hidden border-l border-border/60 bg-background"
            >
              <div className="flex h-full w-[280px] min-w-[280px] flex-col">
                <InspectorBody />
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={open ? 'Collapse inspector' : 'Expand inspector'}
          className={cn(
            'video-studio-press absolute top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted',
            open ? '-left-3' : 'right-2',
          )}
        >
          {open ? (
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeftIcon className="size-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Mobile bottom sheet when something is selected */}
      <Sheet open={mobileOpen && Boolean(selectionKey)} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex h-[min(70vh,560px)] flex-col gap-0 rounded-t-[20px] p-0 lg:hidden"
        >
          <div className="flex shrink-0 justify-center pt-2.5 pb-1">
            <span className="h-1 w-9 rounded-full bg-muted-foreground/25" aria-hidden />
          </div>
          <SheetHeader className="flex-row items-center justify-between border-b border-border/40 px-3 py-2">
            <SheetTitle className="text-[13px] font-semibold tracking-[-0.01em]">Properties</SheetTitle>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-7"
              onClick={() => setMobileOpen(false)}
            >
              <XIcon className="size-3.5" />
            </Button>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <InspectorBody />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
