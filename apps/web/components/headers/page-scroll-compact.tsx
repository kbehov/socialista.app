'use client'

import { usePathname } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export const DASHBOARD_SCROLL_SELECTOR = '[data-dashboard-scroll]'

/** Enter compact above this; leave only after scrolling back below EXIT. Prevents sticky height thrash. */
const COMPACT_ENTER_THRESHOLD = 48
const COMPACT_EXIT_THRESHOLD = 8

type PageScrollCompactContextValue = {
  compact: boolean
  reportScrollTop: (scrollTop: number) => void
}

const PageScrollCompactContext = createContext<PageScrollCompactContextValue | null>(null)

export function usePageScrollCompact(): boolean {
  return useContext(PageScrollCompactContext)?.compact ?? false
}

export function useReportPageScroll() {
  const reportScrollTop = useContext(PageScrollCompactContext)?.reportScrollTop

  return useCallback(
    (scrollTop: number) => {
      reportScrollTop?.(scrollTop)
    },
    [reportScrollTop],
  )
}

function nextCompactState(prev: boolean, scrollTop: number): boolean {
  if (prev) return scrollTop > COMPACT_EXIT_THRESHOLD
  return scrollTop > COMPACT_ENTER_THRESHOLD
}

function PageScrollCompactTracker() {
  const reportScrollTop = useContext(PageScrollCompactContext)?.reportScrollTop
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (!reportScrollTop) return

    const scrollParent = document.querySelector<HTMLElement>(DASHBOARD_SCROLL_SELECTOR)
    if (!scrollParent) {
      reportScrollTop(0)
      return
    }

    const onScroll = () => {
      reportScrollTop(scrollParent.scrollTop)
    }

    onScroll()
    scrollParent.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      scrollParent.removeEventListener('scroll', onScroll)
    }
  }, [pathname, reportScrollTop])

  return null
}

export function PageScrollCompactProvider({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false)
  const compactRef = useRef(compact)
  compactRef.current = compact

  const reportScrollTop = useCallback((scrollTop: number) => {
    const next = nextCompactState(compactRef.current, scrollTop)
    if (next === compactRef.current) return
    compactRef.current = next
    setCompact(next)
  }, [])

  const value = useMemo(() => ({ compact, reportScrollTop }), [compact, reportScrollTop])

  return (
    <PageScrollCompactContext.Provider value={value}>
      <PageScrollCompactTracker />
      {children}
    </PageScrollCompactContext.Provider>
  )
}
