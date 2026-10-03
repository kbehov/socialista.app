'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

import { ABOUT_PAGE } from './about-content'

const sections = ABOUT_PAGE.toc

const chip =
  'inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-medium tracking-[-0.01em] outline-none transition-[background-color,color,border-color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-ink)]'

export function AboutSectionNav() {
  const [activeId, setActiveId] = useState<string>(sections[0].id)

  useEffect(() => {
    const elements = sections.flatMap(section => {
      const node = document.getElementById(section.id)
      return node ? [node] : []
    })
    if (elements.length === 0) return

    const tops = new Map<string, number>()

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) tops.set(entry.target.id, entry.boundingClientRect.top)
          else tops.delete(entry.target.id)
        }

        const next = [...tops.entries()].toSorted((a, b) => a[1] - b[1])[0]
        if (next) setActiveId(next[0])
      },
      { rootMargin: '-12% 0px -55% 0px', threshold: [0, 0.15, 0.4] },
    )

    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <nav aria-label="On this page">
      <ul className="flex flex-nowrap gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {sections.map(section => {
          const current = activeId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  chip,
                  current
                    ? 'border-[var(--landing-charcoal)] bg-[var(--landing-charcoal)] text-white'
                    : 'border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-white text-[var(--landing-ink)] hover:bg-[color-mix(in_srgb,var(--landing-stone)_35%,white)]',
                )}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
