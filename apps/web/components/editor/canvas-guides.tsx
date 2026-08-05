'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { SnapGuide } from '@/lib/editor/snap-guides'
import { cn } from '@/lib/utils'

type CanvasGuidesContextValue = {
  setGuides: (guides: SnapGuide[]) => void
  clearGuides: () => void
  setPersistentGuides: (guides: SnapGuide[]) => void
  clearPersistentGuides: () => void
}

const CanvasGuidesContext = createContext<CanvasGuidesContextValue | null>(null)

type CanvasGuidesProviderProps = {
  children: ReactNode
  /** Optional controlled persistent guides (center lines, manual rulers, etc.) */
  persistentGuides?: SnapGuide[]
  className?: string
}

/**
 * Provides snap-guide state. Renders children in-flow and paints guides as a
 * non-interactive overlay — never wraps children in an absolute full-bleed layer.
 */
export function CanvasGuidesProvider({
  children,
  persistentGuides: controlledPersistent,
  className,
}: CanvasGuidesProviderProps) {
  const [ephemeralGuides, setEphemeralGuides] = useState<SnapGuide[]>([])
  const [uncontrolledPersistent, setUncontrolledPersistent] = useState<SnapGuide[]>([])

  const persistentGuides = controlledPersistent ?? uncontrolledPersistent

  const setGuides = useCallback((next: SnapGuide[]) => {
    setEphemeralGuides(prev => {
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

  const clearGuides = useCallback(() => setEphemeralGuides([]), [])

  const setPersistentGuides = useCallback((next: SnapGuide[]) => {
    setUncontrolledPersistent(next)
  }, [])

  const clearPersistentGuides = useCallback(() => setUncontrolledPersistent([]), [])

  const value = useMemo(
    () => ({ setGuides, clearGuides, setPersistentGuides, clearPersistentGuides }),
    [clearGuides, clearPersistentGuides, setGuides, setPersistentGuides],
  )

  return (
    <CanvasGuidesContext.Provider value={value}>
      <div className={cn('relative size-full', className)}>
        {children}
        <CanvasGuidesOverlay persistent={persistentGuides} ephemeral={ephemeralGuides} />
      </div>
    </CanvasGuidesContext.Provider>
  )
}

export function useCanvasGuides() {
  return useContext(CanvasGuidesContext)
}

export function useCanvasGuidesActions() {
  return useContext(CanvasGuidesContext)
}

function CanvasGuidesOverlay({
  persistent,
  ephemeral,
}: {
  persistent: SnapGuide[]
  ephemeral: SnapGuide[]
}) {
  if (persistent.length === 0 && ephemeral.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden>
      {persistent.map((guide, index) => (
        <GuideLine key={`p-${guide.orientation}-${guide.position}-${index}`} guide={guide} tone="muted" />
      ))}
      {ephemeral.map((guide, index) => (
        <GuideLine key={`e-${guide.orientation}-${guide.position}-${index}`} guide={guide} tone="snap" />
      ))}
    </div>
  )
}

function GuideLine({ guide, tone }: { guide: SnapGuide; tone: 'muted' | 'snap' }) {
  const isVertical = guide.orientation === 'vertical'
  return (
    <div
      className={cn(
        'absolute',
        isVertical ? 'top-0 bottom-0 w-0' : 'left-0 right-0 h-0',
        tone === 'snap'
          ? cn(
              'border-pink-500/50',
              isVertical ? 'border-l border-dashed' : 'border-t border-dashed',
            )
          : cn(
              'border-primary/25',
              isVertical ? 'border-l border-dashed' : 'border-t border-dashed',
            ),
      )}
      style={isVertical ? { left: `${guide.position}%` } : { top: `${guide.position}%` }}
    />
  )
}
