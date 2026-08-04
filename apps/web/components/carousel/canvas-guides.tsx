'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { SnapGuide } from '@/lib/carousel/snap-guides'
import { cn } from '@/lib/utils'

type CanvasGuidesContextValue = {
  setGuides: (guides: SnapGuide[]) => void
  clearGuides: () => void
}

const CanvasGuidesContext = createContext<CanvasGuidesContextValue | null>(null)

export function CanvasGuidesProvider({ children }: { children: ReactNode }) {
  const [guides, setGuidesState] = useState<SnapGuide[]>([])

  const setGuides = useCallback((next: SnapGuide[]) => {
    setGuidesState(prev => {
      if (
        prev.length === next.length &&
        prev.every(
          (guide, index) =>
            guide.orientation === next[index]?.orientation && guide.position === next[index]?.position,
        )
      ) {
        return prev
      }
      return next
    })
  }, [])

  const clearGuides = useCallback(() => setGuidesState([]), [])

  const value = useMemo(() => ({ setGuides, clearGuides }), [clearGuides, setGuides])

  return (
    <CanvasGuidesContext.Provider value={value}>
      <div className="absolute inset-0">
        {children}
        <CanvasGuidesOverlay guides={guides} />
      </div>
    </CanvasGuidesContext.Provider>
  )
}

export function useCanvasGuides() {
  return useContext(CanvasGuidesContext)
}

function CanvasGuidesOverlay({ guides }: { guides: SnapGuide[] }) {
  if (guides.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden>
      {guides.map((guide, index) => (
        <div
          key={`${guide.orientation}-${guide.position}-${index}`}
          className={cn(
            'absolute bg-primary/80 shadow-[0_0_0_1px_rgba(255,255,255,0.35)] transition-opacity duration-150',
            guide.orientation === 'vertical' ? 'top-0 bottom-0 w-px' : 'left-0 right-0 h-px',
          )}
          style={
            guide.orientation === 'vertical'
              ? { left: `${guide.position}%` }
              : { top: `${guide.position}%` }
          }
        />
      ))}
    </div>
  )
}
