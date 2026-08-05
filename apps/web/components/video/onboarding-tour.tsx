'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { openVideoMediaPanel } from '@/lib/video/editor-events'
import { cn } from '@/lib/utils'
import { XIcon } from 'lucide-react'

const TOUR_STORAGE_KEY = 'video-editor-tour:v1'

type TourStep = {
  id: string
  title: string
  body: string
  /** CSS selector for the anchor element */
  anchor: string
  placement: 'right' | 'top' | 'bottom' | 'left'
}

const STEPS: TourStep[] = [
  {
    id: 'media',
    title: 'Add media',
    body: 'Browse files or drag a clip from the Media panel onto the timeline to get started.',
    anchor: '[data-tour-anchor="media"]',
    placement: 'right',
  },
  {
    id: 'timeline',
    title: 'Trim & split',
    body: 'Drag clip edges to trim. Press S to split at the playhead.',
    anchor: '[data-tour-anchor="timeline"]',
    placement: 'top',
  },
  {
    id: 'export',
    title: 'Export when ready',
    body: 'Download an MP4 optimized for your platform. Press ? anytime for shortcuts.',
    anchor: '[data-tour-anchor="export"]',
    placement: 'bottom',
  },
]

function readTourDone(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'done'
  } catch {
    return true
  }
}

function markTourDone(): void {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, 'done')
  } catch {
    // ignore
  }
}

type AnchorRect = { top: number; left: number; width: number; height: number }

function measureAnchor(selector: string): AnchorRect | null {
  const el = document.querySelector(selector)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function coachPosition(
  rect: AnchorRect,
  placement: TourStep['placement'],
): { top: number; left: number } {
  const gap = 12
  switch (placement) {
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.left + rect.width + gap }
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - gap }
    case 'top':
      return { top: rect.top - gap, left: rect.left + rect.width / 2 }
    case 'bottom':
      return { top: rect.top + rect.height + gap, left: rect.left + rect.width / 2 }
  }
}

/** One-time contextual coach marks for first-run video editor users. */
export function VideoOnboardingTour() {
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [rect, setRect] = useState<AnchorRect | null>(null)

  useEffect(() => {
    if (readTourDone()) return
    // Delay so layout / panels mount
    const t = window.setTimeout(() => setStepIndex(0), 600)
    return () => window.clearTimeout(t)
  }, [])

  const step = stepIndex != null ? STEPS[stepIndex] : null

  const refresh = useCallback(() => {
    if (!step) {
      setRect(null)
      return
    }
    setRect(measureAnchor(step.anchor))
  }, [step])

  useEffect(() => {
    refresh()
    if (stepIndex == null) return
    window.addEventListener('resize', refresh)
    const id = window.setInterval(refresh, 500)
    return () => {
      window.removeEventListener('resize', refresh)
      window.clearInterval(id)
    }
  }, [refresh, stepIndex])

  const dismiss = useCallback(() => {
    markTourDone()
    setStepIndex(null)
  }, [])

  const next = useCallback(() => {
    setStepIndex(prev => {
      if (prev == null) return null
      if (prev >= STEPS.length - 1) {
        markTourDone()
        return null
      }
      return prev + 1
    })
  }, [])

  useEffect(() => {
    if (stepIndex === 0) {
      openVideoMediaPanel()
    }
  }, [stepIndex])

  useEffect(() => {
    if (stepIndex == null || !step) return
    if (rect) return
    // Skip missing anchors (e.g. media rail hidden on mobile)
    if (stepIndex < STEPS.length - 1) {
      const t = window.setTimeout(() => setStepIndex(i => (i == null ? null : i + 1)), 0)
      return () => window.clearTimeout(t)
    }
    dismiss()
  }, [dismiss, rect, step, stepIndex])

  if (stepIndex == null || !step || !rect) return null

  const pos = coachPosition(rect, step.placement)
  const transform =
    step.placement === 'right'
      ? 'translateY(-50%)'
      : step.placement === 'left'
        ? 'translate(-100%, -50%)'
        : step.placement === 'top'
          ? 'translate(-50%, -100%)'
          : 'translateX(-50%)'

  return (
    <div className="pointer-events-none fixed inset-0 z-80" aria-live="polite">
      <div
        className="pointer-events-auto absolute w-[min(280px,calc(100vw-24px))] rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg"
        style={{ top: pos.top, left: pos.left, transform }}
        role="dialog"
        aria-label={step.title}
      >
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{step.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {stepIndex + 1} of {STEPS.length}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="video-studio-press rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Dismiss tour"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{step.body}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={dismiss}>
            Skip
          </Button>
          <Button type="button" size="sm" className="video-studio-press h-7 px-3 text-xs" onClick={next}>
            {stepIndex >= STEPS.length - 1 ? 'Got it' : 'Next'}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-none absolute rounded-lg ring-2 ring-primary/50 ring-offset-2 ring-offset-background',
        )}
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        }}
        aria-hidden
      />
    </div>
  )
}
