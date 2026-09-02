'use client'

import { GenerationDetailSheet } from '@/components/generations/generation-detail-sheet'
import { getGenerationTitle } from '@/components/generations/generation-meta'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { cn } from '@/lib/utils'
import type { Generation } from '@socialista/types'
import { ArrowRightIcon, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type RecentImagesStripProps = {
  generations: Generation[]
}

function thumbUrl(generation: Generation): string | undefined {
  const result = generation.result
  if (!result || result.type === 'video') return undefined
  const raw = result.urls?.[0] ?? result.url
  return raw && /^https?:\/\//.test(raw) ? resolveGeneratedImagePreviewUrl(raw) : undefined
}

function extraCount(generation: Generation): number {
  const urls = generation.result?.urls
  if (!urls || urls.length <= 1) return 0
  return urls.length - 1
}

export function RecentImagesStrip({ generations }: RecentImagesStripProps) {
  const [selected, setSelected] = useState<Generation | null>(null)
  const items = generations.filter(generation => Boolean(thumbUrl(generation)))

  if (items.length === 0) return null

  return (
    <section
      aria-labelledby="recent-stills-heading"
      className="mx-auto w-full max-w-5xl px-4 pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] sm:px-6 lg:px-8"
    >
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <h2
          id="recent-stills-heading"
          className="text-[13px] font-medium tracking-[-0.015em] text-foreground/80"
        >
          Recent stills
        </h2>
        <Link
          href={`${DASHBOARD_ROUTES.GENERATIONS}?kind=image`}
          className="inline-flex items-center gap-1 text-[12px] font-medium tracking-[-0.01em] text-black/44 transition-colors hover:text-foreground dark:text-white/44"
        >
          View all
          <ArrowRightIcon className="size-3" strokeWidth={1.75} />
        </Link>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-6">
        {items.map(generation => {
          const src = thumbUrl(generation)
          const title = getGenerationTitle(generation.prompt, generation.kind)
          const extras = extraCount(generation)

          return (
            <li key={generation._id}>
              <button
                type="button"
                aria-label={`View still: ${title}`}
                onClick={() => setSelected(generation)}
                className={cn(
                  'group relative aspect-square w-full overflow-hidden rounded-lg bg-black/[0.04] ring-1 ring-black/8',
                  'transition-[transform,box-shadow] duration-150',
                  'hover:ring-black/16 active:scale-[0.98] motion-reduce:active:scale-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                  'dark:bg-white/[0.04] dark:ring-white/10 dark:hover:ring-white/18',
                )}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote generation URLs vary by provider
                  <img
                    src={src}
                    alt=""
                    className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-black/28 dark:text-white/28">
                    <ImageIcon className="size-4" strokeWidth={1.5} />
                  </span>
                )}
                {extras > 0 ? (
                  <span className="absolute right-1.5 bottom-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-[-0.01em] text-white/90 backdrop-blur-sm">
                    +{extras}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>

      <GenerationDetailSheet
        generation={selected}
        open={selected != null}
        onOpenChange={open => {
          if (!open) setSelected(null)
        }}
      />
    </section>
  )
}
