'use client'

import { cn } from '@/lib/utils'
import { Hand } from 'lucide-react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type MotionStyle,
  type PanInfo,
} from 'motion/react'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

const SWIPE_OFFSET = 96
const SWIPE_VELOCITY = 520

const STACK_SPRING = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.9 }
const ENTER_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.95 }
const EXIT_EASE = [0.22, 1, 0.36, 1] as const
const SNAP_BACK_SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.85 }

const STACK_SCALE_STEP = 0.026
const STACK_Y_STEP = 12

export type SwipeDirection = 'left' | 'right'

export type SwipeStackRenderContext = {
  index: number
  stackDepth: number
  isTop: boolean
  total: number
}

type SwipeStackLabels = {
  left: string
  right: string
}

type SwipeStackProps<T> = {
  items: readonly T[]
  getItemKey: (item: T, index: number) => string
  renderCard: (item: T, context: SwipeStackRenderContext) => ReactNode
  ariaLabel?: string
  className?: string
  stageClassName?: string
  cardClassName?: string
  cardFrameClassName?: string
  maxVisible?: number
  autoplayMs?: number
  pauseOnHover?: boolean
  swipeLabels?: SwipeStackLabels
  overlay?: ReactNode | ((activeIndex: number) => ReactNode)
  liveRegion?: ReactNode | ((activeIndex: number) => ReactNode)
  onSwipe?: (item: T, direction: SwipeDirection, index: number) => void
  onActiveChange?: (index: number) => void
  showSwipeHint?: boolean
  showStackBase?: boolean
  /** Fill a fixed-height parent (e.g. phone shell). Do not use on standalone carousels. */
  fillHeight?: boolean
}

const DEFAULT_SWIPE_LABELS: SwipeStackLabels = {
  left: 'Post',
  right: 'Skip',
}

function getVisibleIndices(activeIndex: number, count: number, maxVisible: number) {
  const visible = Math.min(maxVisible, count)
  return Array.from({ length: visible }, (_, depth) => (activeIndex + depth) % count)
}

type TopSwipeCardProps = {
  children: ReactNode
  disabled: boolean
  exitDirection: SwipeDirection | null
  swipeLabels: SwipeStackLabels
  showSwipeHint: boolean
  onInteraction: () => void
  onDismiss: (direction: SwipeDirection) => void
  onExitComplete: () => void
}

function SwipeStackHint() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-[12%] z-50 flex justify-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute h-px w-16 bg-white/35"
          initial={{ scaleX: 0.4, opacity: 0.4 }}
          animate={{ scaleX: 1, opacity: 0.7 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
        <motion.div
          animate={{ x: [-28, 28, -28] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/50 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.55)] backdrop-blur-md"
        >
          <Hand className="size-5 rotate-[-24deg] text-white" strokeWidth={2.1} />
        </motion.div>
      </div>
    </motion.div>
  )
}

function SwipeStamp({
  label,
  tone,
  className,
  style,
}: {
  label: string
  tone: 'skip' | 'post'
  className?: string
  style?: MotionStyle
}) {
  return (
    <motion.div
      aria-hidden="true"
      style={style}
      className={cn(
        'pointer-events-none absolute z-40 rounded-xl border-[3px] px-3 py-1.5 text-[1.35rem] font-bold uppercase tracking-[0.14em] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)] backdrop-blur-[1px]',
        tone === 'skip'
          ? 'border-[#ff4458] text-[#ff4458]'
          : 'border-[#21c985] text-[#21c985]',
        className,
      )}
    >
      {label}
    </motion.div>
  )
}

function TopSwipeCard({
  children,
  disabled,
  exitDirection,
  swipeLabels,
  showSwipeHint,
  onInteraction,
  onDismiss,
  onExitComplete,
}: TopSwipeCardProps) {
  const x = useMotionValue(0)
  const cardOpacity = useMotionValue(1)
  const rotate = useTransform(x, [-240, 0, 240], [-14, 0, 14])
  const skipOpacity = useTransform(x, [-140, -36, 0], [1, 0.35, 0])
  const postOpacity = useTransform(x, [0, 36, 140], [0, 0.35, 1])

  useEffect(() => {
    if (!exitDirection) return

    const targetX = exitDirection === 'left' ? -520 : 520
    const xControl = animate(x, targetX, {
      duration: 0.52,
      ease: EXIT_EASE,
    })
    const opacityControl = animate(cardOpacity, 0, {
      duration: 0.38,
      ease: [0.4, 0, 0.2, 1],
      delay: 0.12,
    })

    void Promise.all([xControl.finished, opacityControl.finished]).then(() => {
      onExitComplete()
    })

    return () => {
      xControl.stop()
      opacityControl.stop()
    }
  }, [cardOpacity, exitDirection, onExitComplete, x])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || exitDirection) return

    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > SWIPE_OFFSET || velocity > SWIPE_VELOCITY) {
      onDismiss('right')
      return
    }

    if (offset < -SWIPE_OFFSET || velocity < -SWIPE_VELOCITY) {
      onDismiss('left')
      return
    }

    void animate(x, 0, SNAP_BACK_SPRING)
  }

  return (
    <motion.div
      className="absolute inset-0 z-30 cursor-grab select-none active:cursor-grabbing"
      style={{ x, rotate, opacity: cardOpacity, touchAction: 'none' }}
      drag={disabled || exitDirection ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.82}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 380, bounceDamping: 32, power: 0.28 }}
      onDragStart={() => onInteraction()}
      initial={{ scale: 1 - STACK_SCALE_STEP, y: STACK_Y_STEP }}
      animate={exitDirection ? undefined : { scale: 1, y: 0 }}
      transition={ENTER_SPRING}
      onDragEnd={handleDragEnd}
    >
      {children}

      {exitDirection === 'left' ? (
        <SwipeStamp
          label={swipeLabels.left}
          tone="post"
          className="right-6 top-8 rotate-[14deg] opacity-100"
        />
      ) : exitDirection === 'right' ? (
        <SwipeStamp
          label={swipeLabels.right}
          tone="skip"
          className="left-6 top-8 -rotate-[14deg] opacity-100"
        />
      ) : (
        <>
          <SwipeStamp
            label={swipeLabels.left}
            tone="post"
            className="right-6 top-8 rotate-[14deg]"
            style={{ opacity: skipOpacity }}
          />
          <SwipeStamp
            label={swipeLabels.right}
            tone="skip"
            className="left-6 top-8 -rotate-[14deg]"
            style={{ opacity: postOpacity }}
          />
        </>
      )}

      <AnimatePresence>
        {showSwipeHint && !exitDirection ? <SwipeStackHint key="swipe-hint" /> : null}
      </AnimatePresence>
    </motion.div>
  )
}

export function SwipeStack<T>({
  items,
  getItemKey,
  renderCard,
  ariaLabel = 'Swipe carousel',
  className,
  stageClassName,
  cardClassName,
  cardFrameClassName,
  maxVisible = 3,
  autoplayMs = 0,
  pauseOnHover = true,
  swipeLabels = DEFAULT_SWIPE_LABELS,
  overlay,
  liveRegion,
  onSwipe,
  onActiveChange,
  showSwipeHint = true,
  showStackBase = true,
  fillHeight = false,
}: SwipeStackProps<T>) {
  const reduceMotion = useReducedMotion()
  const count = items.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const paused = pauseOnHover && (hoverPaused || pageHidden)
  const hintVisible = showSwipeHint && !hasInteracted && !reduceMotion && count > 1

  const markInteracted = useCallback(() => {
    setHasInteracted(true)
  }, [])

  const visibleIndices = useMemo(
    () => getVisibleIndices(activeIndex, count, maxVisible),
    [activeIndex, count, maxVisible],
  )

  const dismiss = useCallback(
    (direction: SwipeDirection) => {
      if (count <= 1 || exitDirection) return

      const item = items[activeIndex]
      if (!item) return

      onSwipe?.(item, direction, activeIndex)
      markInteracted()

      if (reduceMotion) {
        const next = (activeIndex + 1) % count
        setActiveIndex(next)
        onActiveChange?.(next)
        return
      }

      setExitDirection(direction)
    },
    [activeIndex, count, exitDirection, items, markInteracted, onActiveChange, onSwipe, reduceMotion],
  )

  const completeDismiss = useCallback(() => {
    const next = (activeIndex + 1) % count
    setActiveIndex(next)
    onActiveChange?.(next)
    setExitDirection(null)
  }, [activeIndex, count, onActiveChange])

  const goNext = useCallback(() => {
    dismiss('left')
  }, [dismiss])

  const goPrev = useCallback(() => {
    if (count <= 1) return
    setActiveIndex(current => {
      const next = (current - 1 + count) % count
      onActiveChange?.(next)
      return next
    })
  }, [count, onActiveChange])

  useEffect(() => {
    if (reduceMotion || paused || count <= 1 || autoplayMs <= 0 || exitDirection) return

    const id = window.setInterval(() => {
      dismiss('left')
    }, autoplayMs)

    return () => window.clearInterval(id)
  }, [autoplayMs, count, dismiss, exitDirection, paused, reduceMotion])

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
      markInteracted()
      goNext()
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      markInteracted()
      goPrev()
    }
  }

  if (count === 0) return null

  const topIndex = visibleIndices[0] ?? activeIndex
  const topItem = items[topIndex]
  const stackIndices = visibleIndices.slice(1)

  return (
    <div
      className={cn('w-full', fillHeight ? 'h-full min-h-0' : undefined, className)}
      onMouseEnter={pauseOnHover ? () => setHoverPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setHoverPaused(false) : undefined}
    >
      <div
        className={cn(
          'relative mx-auto outline-none focus-visible:rounded-[2rem] focus-visible:ring-[3px] focus-visible:ring-ring/45',
          fillHeight ? 'h-full min-h-0' : undefined,
          stageClassName,
        )}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className={cn('relative mx-auto', cardClassName)}>
          <div className="relative">
            <div
              className={cn(
                'relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] shadow-[0_24px_48px_-16px_color-mix(in_oklch,var(--foreground)_20%,transparent),0_8px_24px_-8px_color-mix(in_oklch,var(--foreground)_12%,transparent),0_2px_6px_-1px_color-mix(in_oklch,var(--foreground)_8%,transparent)]',
                cardFrameClassName,
              )}
            >
            {[...stackIndices].reverse().map((itemIndex, reverseDepth) => {
              const stackDepth = stackIndices.length - reverseDepth
              const item = items[itemIndex]
              if (!item) return null

              return (
                <motion.div
                  key={getItemKey(item, itemIndex)}
                  className="pointer-events-none absolute inset-0"
                  initial={false}
                  animate={{
                    scale: 1 - stackDepth * STACK_SCALE_STEP,
                    y: stackDepth * STACK_Y_STEP,
                    opacity: 1 - stackDepth * STACK_SCALE_STEP * 2,
                  }}
                  transition={STACK_SPRING}
                  style={{ zIndex: 20 - stackDepth }}
                >
                  {renderCard(item, {
                    index: itemIndex,
                    stackDepth,
                    isTop: false,
                    total: count,
                  })}
                </motion.div>
              )
            })}

            {topItem ? (
              reduceMotion ? (
                <div className="absolute inset-0 z-30">
                  {renderCard(topItem, {
                    index: topIndex,
                    stackDepth: 0,
                    isTop: true,
                    total: count,
                  })}
                </div>
              ) : (
                <TopSwipeCard
                  key={getItemKey(topItem, topIndex)}
                  disabled={count <= 1}
                  exitDirection={exitDirection}
                  swipeLabels={swipeLabels}
                  showSwipeHint={hintVisible}
                  onInteraction={markInteracted}
                  onDismiss={dismiss}
                  onExitComplete={completeDismiss}
                >
                  {renderCard(topItem, {
                    index: topIndex,
                    stackDepth: 0,
                    isTop: true,
                    total: count,
                  })}
                </TopSwipeCard>
              )
            ) : null}
            </div>

            {typeof overlay === 'function' ? overlay(topIndex) : overlay}
          </div>

          {showStackBase ? (
            <div
              aria-hidden="true"
              className="pointer-events-none mt-4 flex flex-col items-center gap-1.5 px-[8%]"
            >
              <div className="h-1 w-full rounded-full bg-border/50" />
              <div className="h-1 w-[92%] rounded-full bg-border/40" />
              <div className="h-1 w-[84%] rounded-full bg-border/30" />
            </div>
          ) : null}
        </div>

        {typeof liveRegion === 'function' ? liveRegion(topIndex) : liveRegion}
      </div>
    </div>
  )
}
