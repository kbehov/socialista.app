'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { SHIP_IT_SECTION, type ShipItTabId } from './content'
import { landingWorkflowPanel, landingWorkflowPanelDark } from './landing-classes'
import { WorkflowAnalyticsMockup, WorkflowPublishMockup } from './landing-workflow-mockups'
import { WorkflowSchedulingMockup } from './landing-workflow-scheduling-mockup'
import { SectionCta } from './section-cta'

const AUTO_ADVANCE_MS = 7_000
const TABS = SHIP_IT_SECTION.tabs

const MOCKUPS: Record<ShipItTabId, () => ReactNode> = {
  publish: () => <WorkflowPublishMockup />,
  schedule: () => <WorkflowSchedulingMockup />,
  analyze: () => <WorkflowAnalyticsMockup />,
}

export function ShipItTabs() {
  const baseId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const reduceMotion = useReducedMotion()
  const inView = useInView(rootRef, { amount: 0.4 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Any manual selection hands control to the visitor for good
  const [userControlled, setUserControlled] = useState(false)

  const autoAdvance = !reduceMotion && !userControlled && inView && !paused
  const active = TABS[activeIndex]!

  useEffect(() => {
    if (!autoAdvance) return
    const timeout = window.setTimeout(() => {
      setActiveIndex(index => (index + 1) % TABS.length)
    }, AUTO_ADVANCE_MS)
    return () => window.clearTimeout(timeout)
  }, [autoAdvance, activeIndex])

  const select = (index: number, focus = false) => {
    setUserControlled(true)
    setActiveIndex(index)
    if (focus) tabRefs.current[index]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = TABS.length - 1
    const next =
      event.key === 'ArrowRight'
        ? activeIndex === last ? 0 : activeIndex + 1
        : event.key === 'ArrowLeft'
          ? activeIndex === 0 ? last : activeIndex - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next == null) return
    event.preventDefault()
    select(next, true)
  }

  const tabId = (id: ShipItTabId) => `${baseId}-tab-${id}`
  const panelId = (id: ShipItTabId) => `${baseId}-panel-${id}`

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className="flex flex-col lg:col-span-5">
        <div
          role="tablist"
          aria-label="Workflow"
          onKeyDown={onKeyDown}
          className="inline-flex w-full rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_7%,transparent)] bg-[var(--landing-surface-muted)] p-1 sm:w-auto sm:self-start"
        >
          {TABS.map((tab, index) => {
            const selected = index === activeIndex
            return (
              <button
                key={tab.id}
                ref={el => {
                  tabRefs.current[index] = el
                }}
                id={tabId(tab.id)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId(tab.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                className={cn(
                  'relative flex min-h-11 flex-1 items-center justify-center overflow-hidden rounded-full px-4 py-2 text-sm font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] sm:flex-none sm:px-5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-ink)]/30',
                  selected
                    ? 'bg-white text-[var(--landing-ink)] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_0_0_1px_rgb(0_0_0/0.04)]'
                    : 'text-[var(--landing-muted)] hover:text-[var(--landing-ink)]',
                )}
              >
                {tab.label}
                {selected && autoAdvance ? (
                  <span
                    key={activeIndex}
                    aria-hidden="true"
                    className="landing-tab-progress absolute inset-x-4 bottom-1 h-px origin-left bg-[var(--landing-ink)]/25"
                    style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                  />
                ) : null}
              </button>
            )
          })}
        </div>

        <div key={active.id} className="mt-8 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
          <h3 className="text-[1.375rem] font-semibold leading-snug tracking-[-0.03em] text-[var(--landing-ink)] sm:text-[1.625rem]">
            {active.title}
          </h3>
          <p className="mt-3 max-w-md text-pretty text-[0.9375rem] leading-[1.6] text-[var(--landing-muted)]">
            {active.description}
          </p>
          <ul className="mt-6 space-y-3">
            {active.bullets.map(bullet => (
              <li key={bullet} className="flex items-start gap-3 text-sm text-[var(--landing-ink)]">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]"
                  aria-hidden="true"
                >
                  <Check className="size-3" strokeWidth={2} />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <SectionCta label={SHIP_IT_SECTION.cta} className="mt-9 items-start max-lg:items-center" />
      </div>

      <div className="min-w-0 lg:col-span-7">
        {TABS.map(tab => {
          const selected = tab.id === active.id
          return (
            <div
              key={tab.id}
              id={panelId(tab.id)}
              role="tabpanel"
              aria-labelledby={tabId(tab.id)}
              hidden={!selected}
              className={cn(
                tab.id === 'schedule' ? landingWorkflowPanelDark : landingWorkflowPanel,
                'animate-in fade-in-0 duration-300',
              )}
            >
              {/* Mount only the active mockup — keeps the date-based calendar client-only */}
              {selected ? MOCKUPS[tab.id]() : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
