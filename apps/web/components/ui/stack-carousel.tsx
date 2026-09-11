'use client'

import { CarouselIndicators } from '@/components/ui/carousel-indicators'
import { cn } from '@/lib/utils'
import { useReducedMotion } from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type TouchEvent,
} from 'react'

export function wrapOffset(index: number, active: number, count: number) {
  let offset = index - active
  const half = Math.floor(count / 2)
  if (offset > half) offset -= count
  if (offset < -half) offset += count
  return offset
}

function nextIndex(active: number, count: number) {
  return (active + 1) % count
}

function prevIndex(active: number, count: number) {
  return (active - 1 + count) % count
}

export type StackCarouselRenderContext = {
  index: number
  offset: number
  isActive: boolean
  goTo: (index: number) => void
}

type StackCarouselProps<T> = {
  items: readonly T[]
  getItemKey: (item: T, index: number) => string
  renderSlide: (item: T, context: StackCarouselRenderContext) => ReactNode
  ariaLabel?: string
  className?: string
  stageClassName?: string
  indicatorsClassName?: string
  autoplayMs?: number
  pauseOnHover?: boolean
  overlay?: ReactNode | ((activeIndex: number) => ReactNode)
  liveRegion?: ReactNode | ((activeIndex: number) => ReactNode)
  showIndicators?: boolean
  indicatorLabel?: string
}

export function StackCarousel<T>({
  items,
  getItemKey,
  renderSlide,
  ariaLabel = 'Carousel',
  className,
  stageClassName,
  indicatorsClassName,
  autoplayMs = 4500,
  pauseOnHover = true,
  overlay,
  liveRegion,
  showIndicators = true,
  indicatorLabel,
}: StackCarouselProps<T>) {
  const reduceMotion = useReducedMotion()
  const count = items.length
  const [active, setActive] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const paused = pauseOnHover && (hoverPaused || pageHidden)

  const goTo = useCallback((index: number) => {
    setActive(index)
  }, [])

  const goNext = useCallback(() => {
    setActive(current => nextIndex(current, count))
  }, [count])

  const goPrev = useCallback(() => {
    setActive(current => prevIndex(current, count))
  }, [count])

  useEffect(() => {
    if (reduceMotion || paused || count <= 1 || autoplayMs <= 0) return

    const id = window.setInterval(() => {
      setActive(current => nextIndex(current, count))
    }, autoplayMs)

    return () => window.clearInterval(id)
  }, [reduceMotion, paused, count, autoplayMs])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const onVisibility = () => {
      setPageHidden(document.hidden)
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrev()
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
    if (pauseOnHover) setHoverPaused(true)
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current
    const end = event.changedTouches[0]?.clientX
    touchStartX.current = null
    if (pauseOnHover) setHoverPaused(false)
    if (start == null || end == null) return
    const delta = start - end
    if (delta > 40) goNext()
    if (delta < -40) goPrev()
  }

  return (
    <div
      className={cn('w-full', className)}
      onMouseEnter={pauseOnHover ? () => setHoverPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setHoverPaused(false) : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          'relative isolate mx-auto h-[clamp(21rem,48vw,33.5rem)] outline-none focus-visible:rounded-3xl focus-visible:ring-[3px] focus-visible:ring-ring/45',
          stageClassName
        )}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => {
          const offset = wrapOffset(index, active, count)
          return (
            <div key={getItemKey(item, index)}>
              {renderSlide(item, {
                index,
                offset,
                isActive: index === active,
                goTo,
              })}
            </div>
          )
        })}

        {typeof liveRegion === 'function' ? liveRegion(active) : liveRegion}
        {typeof overlay === 'function' ? overlay(active) : overlay}
      </div>

      {showIndicators ? (
        <CarouselIndicators
          count={count}
          activeIndex={active}
          onSelect={goTo}
          label={indicatorLabel ?? ariaLabel}
          className={cn('mt-5', indicatorsClassName)}
        />
      ) : null}
    </div>
  )
}
