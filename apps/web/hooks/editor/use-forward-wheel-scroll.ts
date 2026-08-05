import { type RefObject, useEffect } from 'react'

function canScrollInDirection(element: HTMLElement, deltaY: number): boolean {
  const { scrollTop, scrollHeight, clientHeight } = element
  if (scrollHeight <= clientHeight + 1) return false

  if (deltaY < 0) return scrollTop > 0
  if (deltaY > 0) return scrollTop + clientHeight < scrollHeight - 1
  return false
}

/**
 * Forwards vertical wheel deltas to a scroll container when nested descendants
 * (e.g. Embla carousel) would otherwise absorb them.
 *
 * Does not trap the wheel at scroll boundaries — the page can keep scrolling.
 */
export function useForwardWheelScroll(scrollContainerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    function onWheel(e: WheelEvent) {
      if (!e.deltaY || !container) return

      let el = e.target as HTMLElement | null

      while (el && el !== container) {
        const { overflowY } = window.getComputedStyle(el)
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll'

        if (isScrollable && canScrollInDirection(el, e.deltaY)) {
          return
        }

        el = el.parentElement
      }

      if (!canScrollInDirection(container, e.deltaY)) {
        return
      }

      e.preventDefault()
      container.scrollBy(0, e.deltaY)
    }

    container.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => container.removeEventListener('wheel', onWheel, { capture: true })
  }, [scrollContainerRef])
}
