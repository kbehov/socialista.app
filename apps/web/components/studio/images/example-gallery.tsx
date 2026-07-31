'use client'

import { EmptyState } from '@/components/common/empty-state'
import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import { cn } from '@/lib/utils'
import { commitHaptic } from '@/utils/haptics'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CopyIcon, ImagesIcon, SparklesIcon, WandSparklesIcon } from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'
import { useCopyPrompt } from '@/hooks/use-copy-prompt'
import { getAspectRatioClass } from '@/utils/aspect-ratio'
import { filterExamplesByVibe, VIBE_LABELS, type ImageExample } from '@/lib/studio/images/examples'
import { VibeSelector } from './vibe-selector'

function ExampleCard({
  example,
  isActive,
  onRemix,
  onCopy,
}: {
  example: ImageExample
  isActive: boolean
  onRemix: () => void
  onCopy: () => void
}) {
  return (
    <article
      className={cn(
        'group relative mb-3.5 break-inside-avoid overflow-hidden rounded-[1.125rem]',
        'ring-1 ring-black/[0.06] transition-[box-shadow,transform,ring-color] duration-300 ease-out',
        'hover:shadow-[0_16px_48px_-20px_rgba(0,0,0,0.4)]',
        'dark:ring-white/[0.08]',
        isActive &&
          'ring-2 ring-foreground/25 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] ring-offset-2 ring-offset-background',
      )}
    >
      <div className={cn('relative w-full bg-muted/35', getAspectRatioClass(example.aspectRatio))}>
        <button
          type="button"
          onClick={() => {
            commitHaptic({ vibrateDuration: 8 })
            onRemix()
          }}
          className="absolute inset-0 z-0 rounded-[1.125rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`Remix ${example.title}`}
        />

        <Image
          alt={example.title}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          src={example.imageUrl}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/5 opacity-95 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-1.5">
            {example.trending ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold tracking-[-0.01em] text-black shadow-sm backdrop-blur-sm">
                <SparklesIcon className="size-2.5" />
                Popular
              </span>
            ) : null}
            <span className="rounded-md bg-black/45 px-2 py-0.5 text-[10px] font-medium tracking-[-0.01em] text-white/90 backdrop-blur-md ring-1 ring-white/10">
              {VIBE_LABELS[example.vibe]}
            </span>
          </div>
          <span className="rounded-md bg-black/45 px-2 py-0.5 text-[10px] font-medium tabular-nums tracking-[-0.01em] text-white/80 backdrop-blur-md ring-1 ring-white/10">
            {example.aspectRatio}
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 space-y-2.5 p-3 pt-12">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-white">
              {example.title}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug tracking-[-0.01em] text-white/60">
              {example.hook}
            </p>
          </div>

          <div
            className={cn(
              'pointer-events-auto flex items-center gap-1.5',
              'opacity-100 translate-y-0 transition-[opacity,transform] duration-200 ease-out',
              'sm:translate-y-1.5 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100',
              'motion-reduce:transition-none motion-reduce:sm:translate-y-0 motion-reduce:sm:opacity-100',
            )}
          >
            <button
              type="button"
              onClick={() => {
                commitHaptic({ vibrateDuration: 8 })
                onRemix()
              }}
              className={cn(
                'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-semibold tracking-[-0.015em] text-black',
                'shadow-sm transition-[transform,box-shadow] duration-150 hover:shadow-md active:scale-[0.97]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
              )}
            >
              <WandSparklesIcon className="size-3.5" />
              Remix
            </button>
            <button
              type="button"
              onClick={onCopy}
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/12 text-white backdrop-blur-md',
                'ring-1 ring-white/20 transition-[background-color,transform] hover:bg-white/22 active:scale-[0.97]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
              )}
              aria-label={`Copy prompt for ${example.title}`}
            >
              <CopyIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ExampleGallery() {
  const { selectedVibe, setSelectedVibe, activeExampleId, remixExample } = useImageStudio()
  const { copyPrompt } = useCopyPrompt()
  const reduceMotion = useReducedMotion()

  const examples = useMemo(() => filterExamplesByVibe(selectedVibe), [selectedVibe])

  return (
    <section className="space-y-7 sm:space-y-8" aria-labelledby="examples-gallery-heading">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2
              id="examples-gallery-heading"
              className="text-[16px] font-semibold tracking-[-0.02em] text-foreground"
            >
              Examples
            </h2>
            {examples.length > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted/60 px-1.5 text-[10px] font-medium tabular-nums tracking-[-0.01em] text-muted-foreground ring-1 ring-border/40">
                {examples.length}
              </span>
            ) : null}
          </div>
          <p className="max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
            Remix a look or copy the prompt to start faster.
          </p>
        </div>
        <VibeSelector
          value={selectedVibe}
          onChange={setSelectedVibe}
          className="w-full sm:max-w-md sm:shrink-0"
        />
      </div>

      {examples.length === 0 ? (
        <EmptyState
          description={`More coming soon — be the first to set the vibe for ${VIBE_LABELS[selectedVibe]}.`}
          icon={ImagesIcon}
          minHeight="sm"
          title="No examples yet"
        />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedVibe}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="columns-2 gap-3.5 sm:columns-3 sm:gap-4 lg:columns-4"
            role="list"
            aria-label="Example gallery"
          >
            {examples.map(example => (
              <ExampleCard
                key={example.id}
                example={example}
                isActive={activeExampleId === example.id}
                onRemix={() => remixExample(example)}
                onCopy={() => void copyPrompt(example.prompt, 'Prompt copied')}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  )
}
