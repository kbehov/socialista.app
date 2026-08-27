'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { saveSlideToWorkspace } from '@/lib/carousel/export'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { getWorkspaceId, useWorkspaceStore } from '@/store/workspace.store'
import type { Slide, SlideId } from '@socialista/types'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { CopyIcon, FolderInputIcon, Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { SlideCanvas } from './slide-canvas'

const THUMB_WIDTH = 72

export function SlidePagesStrip({ className }: { className?: string }) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const addSlide = useEditorStore(s => s.addSlide)
  const setSlideOrder = useEditorStore(s => s.setSlideOrder)
  const stripRef = useRef<HTMLDivElement>(null)

  const activeIndex = slides.findIndex(slide => slide.id === activeSlideId)
  const currentPage = activeIndex >= 0 ? activeIndex + 1 : 0

  useEffect(() => {
    if (!stripRef.current) return
    const scroller = stripRef.current
    const activeThumb = scroller.querySelector<HTMLElement>('[data-active-slide="true"]')
    if (!activeThumb) return

    const targetScroll = activeThumb.offsetLeft - (scroller.clientWidth - activeThumb.offsetWidth) / 2
    scroller.scrollTo({ left: Math.max(0, targetScroll), behavior: 'auto' })
  }, [activeSlideId, slides.length])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return
      const ids = useEditorStore.getState().slides.map(slide => slide.id)
      const reordered = move(ids, event) as SlideId[]
      if (reordered.every((id, i) => id === ids[i])) return
      setSlideOrder(reordered)
    },
    [setSlideOrder],
  )

  return (
    <div
      data-pages-strip
      className={cn(
        'slideshow-editor-filmstrip-section flex min-w-0 shrink-0 items-center gap-3 border-t border-border/40 px-3 py-2',
        className,
      )}
    >
      <div className="hidden shrink-0 items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground sm:flex">
        <span className="font-medium text-foreground">Pages</span>
        <span>
          {currentPage} of {slides.length}
        </span>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div
          ref={stripRef}
          role="listbox"
          aria-label="Pages"
          aria-orientation="horizontal"
          className="studio-filmstrip-mask no-scrollbar flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto py-0.5"
        >
          {slides.map((slide, index) => (
            <PageThumb key={slide.id} slide={slide} index={index} slideCount={slides.length} />
          ))}
        </div>
      </DragDropProvider>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="size-9 shrink-0 touch-manipulation sm:size-8"
            onClick={() => addSlide()}
            aria-label="Add slide"
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add slide</TooltipContent>
      </Tooltip>
    </div>
  )
}

function PageThumb({
  slide,
  index,
  slideCount,
}: {
  slide: Slide
  index: number
  slideCount: number
}) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const removeSlide = useEditorStore(s => s.removeSlide)
  const duplicateSlide = useEditorStore(s => s.duplicateSlide)
  const reorderSlides = useEditorStore(s => s.reorderSlides)
  const canvas = useEditorStore(s => s.canvas)
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [savingToFiles, setSavingToFiles] = useState(false)

  const thumbHeight = THUMB_WIDTH * (canvas.height / canvas.width)
  const active = slide.id === activeSlideId

  const { ref, isDragging, isDropTarget } = useSortable({
    id: slide.id,
    index,
  })

  const handleSaveToFiles = useCallback(async () => {
    const workspaceId = getWorkspaceId(currentWorkspace)
    if (!workspaceId) {
      toast.error('No workspace selected')
      return
    }
    if (savingToFiles) return

    setSavingToFiles(true)
    try {
      await saveSlideToWorkspace(workspaceId, slide, canvas.width, index)
      toast.success('Saved to your files')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save to files')
    } finally {
      setSavingToFiles(false)
    }
  }, [canvas.width, currentWorkspace, index, savingToFiles, slide])

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={ref}
            role="option"
            data-slide-thumb
            data-active-slide={active ? 'true' : undefined}
            aria-selected={active}
            aria-label={`Page ${index + 1}`}
            aria-current={active ? 'true' : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => setActiveSlide(slide.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setActiveSlide(slide.id)
              }
            }}
            style={{ width: THUMB_WIDTH, height: thumbHeight }}
            className={cn(
              'group relative shrink-0 cursor-grab overflow-hidden rounded-md bg-background outline-none transition-[opacity,box-shadow,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
              active
                ? 'opacity-100 ring-2 ring-foreground'
                : 'opacity-70 ring-1 ring-border/70 hover:opacity-100 hover:ring-border',
              isDragging && 'z-20 scale-[1.02] opacity-80 ring-2 ring-foreground/50',
              isDropTarget && !isDragging && 'ring-2 ring-foreground/40',
            )}
          >
            <SlideCanvas slide={slide} interactive={false} forceWidth={THUMB_WIDTH} className="size-full" />
            <span className="pointer-events-none absolute top-1 left-1 flex size-4 items-center justify-center rounded bg-background/90 text-[9px] font-medium tabular-nums text-foreground">
              {index + 1}
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-0.5 bg-black/40 p-0.5 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
              <button
                type="button"
                className="flex size-5 items-center justify-center rounded-sm bg-background text-foreground transition-colors hover:bg-muted"
                aria-label={`Duplicate page ${index + 1}`}
                onClick={event => {
                  event.stopPropagation()
                  duplicateSlide(slide.id)
                }}
              >
                <CopyIcon className="size-3" />
              </button>
              <button
                type="button"
                className="flex size-5 items-center justify-center rounded-sm bg-background text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
                aria-label={`Delete page ${index + 1}`}
                disabled={slideCount <= 1}
                onClick={event => {
                  event.stopPropagation()
                  setDeleteOpen(true)
                }}
              >
                <Trash2Icon className="size-3" />
              </button>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setActiveSlide(slide.id)}>Open</ContextMenuItem>
          <ContextMenuItem onSelect={() => duplicateSlide(slide.id)}>
            <CopyIcon className="size-3.5" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem disabled={savingToFiles} onSelect={() => void handleSaveToFiles()}>
            {savingToFiles ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <FolderInputIcon className="size-3.5" />
            )}
            {savingToFiles ? 'Saving…' : 'Save to files'}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={index === 0}
            onSelect={() => reorderSlides(slide.id, slides[index - 1]!.id)}
          >
            Move left
          </ContextMenuItem>
          <ContextMenuItem
            disabled={index === slideCount - 1}
            onSelect={() => reorderSlides(slide.id, slides[index + 1]!.id)}
          >
            Move right
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            disabled={slideCount <= 1}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="size-3.5" />
            Delete page
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this page?"
        description="This removes the page and its layers. You can undo with ⌘Z."
        confirmLabel="Delete page"
        onConfirm={() => {
          removeSlide(slide.id)
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
