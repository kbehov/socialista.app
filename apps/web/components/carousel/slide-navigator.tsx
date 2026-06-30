'use client'

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { SlideCanvas } from './slide-canvas'

type SlideNavigatorProps = {
  variant?: 'default' | 'filmstrip'
}

export function SlideNavigator({ variant = 'default' }: SlideNavigatorProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const addSlide = useEditorStore(s => s.addSlide)
  const removeSlide = useEditorStore(s => s.removeSlide)
  const duplicateSlide = useEditorStore(s => s.duplicateSlide)
  const reorderSlides = useEditorStore(s => s.reorderSlides)

  const isFilmstrip = variant === 'filmstrip'
  const thumbWidth = isFilmstrip ? 72 : 128

  return (
    <div className={cn('flex flex-col gap-2', isFilmstrip && 'gap-1.5')}>
      {!isFilmstrip ? (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {slides.length} slide{slides.length === 1 ? '' : 's'}
          </span>
          <Button size="xs" variant="outline" onClick={() => addSlide()}>
            <PlusIcon /> Add slide
          </Button>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5">
          {slides.map((slide, index) => {
            const active = slide.id === activeSlideId
            return (
              <ContextMenu key={slide.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      'group relative shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition',
                      active ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-muted-foreground/40',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSlide(slide.id)}
                      style={{ width: thumbWidth }}
                      className="block"
                      aria-label={`Slide ${index + 1}`}
                      aria-current={active ? 'true' : undefined}
                    >
                      <SlideCanvas slide={slide} interactive={false} forceWidth={thumbWidth} />
                    </button>
                    <div className="pointer-events-none absolute left-1 top-1 rounded bg-background/90 px-1 text-[9px] font-semibold text-muted-foreground">
                      {index + 1}
                    </div>
                    {!isFilmstrip ? (
                      <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                        <FilmstripAction
                          onClick={() => reorderSlides(slide.id, slides[index - 1].id)}
                          disabled={index === 0}
                          label="Move left"
                        >
                          <ChevronLeftIcon className="size-3" />
                        </FilmstripAction>
                        <FilmstripAction
                          onClick={() => reorderSlides(slide.id, slides[index + 1].id)}
                          disabled={index === slides.length - 1}
                          label="Move right"
                        >
                          <ChevronRightIcon className="size-3" />
                        </FilmstripAction>
                        <FilmstripAction
                          onClick={() => removeSlide(slide.id)}
                          disabled={slides.length <= 1}
                          label="Delete slide"
                          destructive
                        >
                          <Trash2Icon className="size-3" />
                        </FilmstripAction>
                      </div>
                    ) : null}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onSelect={() => setActiveSlide(slide.id)}>Open</ContextMenuItem>
                  <ContextMenuItem onSelect={() => duplicateSlide(slide.id)}>Duplicate slide</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    disabled={index === 0}
                    onSelect={() => reorderSlides(slide.id, slides[index - 1].id)}
                  >
                    Move left
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={index === slides.length - 1}
                    onSelect={() => reorderSlides(slide.id, slides[index + 1].id)}
                  >
                    Move right
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    disabled={slides.length <= 1}
                    onSelect={() => removeSlide(slide.id)}
                  >
                    Delete slide
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>

        {isFilmstrip ? (
          <Button size="icon-sm" variant="outline" className="shrink-0" onClick={() => addSlide()} aria-label="Add slide">
            <PlusIcon />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function FilmstripAction({
  children,
  onClick,
  disabled,
  label,
  destructive,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        'pointer-events-auto rounded bg-background/80 p-0.5 hover:bg-background disabled:opacity-30',
        destructive ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  )
}
