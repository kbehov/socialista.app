'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

const SCROLL_COMPACT_THRESHOLD = 12

type PageScrollCompactContextValue = {
  compact: boolean
  setCompact: (compact: boolean) => void
}

const PageScrollCompactContext = createContext<PageScrollCompactContextValue | null>(null)

export function PageScrollCompactProvider({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false)
  const value = useMemo(() => ({ compact, setCompact }), [compact])

  return <PageScrollCompactContext.Provider value={value}>{children}</PageScrollCompactContext.Provider>
}

export function usePageScrollCompact(): boolean {
  return useContext(PageScrollCompactContext)?.compact ?? false
}

export function useReportPageScroll() {
  const context = useContext(PageScrollCompactContext)

  return useCallback(
    (scrollTop: number) => {
      context?.setCompact(scrollTop > SCROLL_COMPACT_THRESHOLD)
    },
    [context],
  )
}
