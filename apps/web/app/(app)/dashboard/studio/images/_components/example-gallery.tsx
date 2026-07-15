'use client'

import { useImageStudio } from '@/context/image-studio-provider'
import { cn } from '@/lib/utils'
import { CopyIcon, SparklesIcon } from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'
import { useCopyPrompt } from '../../../../../../hooks/use-copy-prompt'
import { filterExamplesByVibe, VIBE_LABELS, type ImageExample } from '../_lib/examples'
import { VibeSelector } from './vibe-selector'

function getAspectClass(aspectRatio: ImageExample['aspectRatio']) {
  switch (aspectRatio) {
    case '9:16':
      return 'aspect-[9/16]'
    case '16:9':
      return 'aspect-video'
    case '4:3':
      return 'aspect-[4/3]'
    default:
      return 'aspect-square'
  }
}

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
        'group relative mb-3 break-inside-avoid overflow-hidden rounded-xl',
        isActive && 'ring-2 ring-foreground/25 ring-offset-2 ring-offset-background',
      )}
    >
      <div className={cn('relative w-full bg-muted/30', getAspectClass(example.aspectRatio))}>
        <button
          type="button"
          onClick={onRemix}
          className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label={`Remix ${example.title}`}
        />

        <Image
          alt={example.title}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          src={example.imageUrl}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/20"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <div className="flex flex-wrap gap-1">
            {example.trending ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-black backdrop-blur-sm">
                <SparklesIcon className="size-3" />
                Popular
              </span>
            ) : null}
            <span className="rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              {VIBE_LABELS[example.vibe]}
            </span>
            <span className="rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
              {example.aspectRatio}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className={cn(
            'absolute right-2.5 top-2.5 z-10 inline-flex size-8 items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur-sm transition-opacity',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100',
            'hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          )}
          aria-label="Copy prompt"
        >
          <CopyIcon className="size-3.5" />
        </button>
      </div>
    </article>
  )
}

export function ExampleGallery() {
  const { selectedVibe, setSelectedVibe, activeExampleId, remixExample } = useImageStudio()
  const { copyPrompt } = useCopyPrompt()

  const examples = useMemo(() => filterExamplesByVibe(selectedVibe), [selectedVibe])

  return (
    <section className="space-y-5" aria-labelledby="examples-gallery-heading">
      <div className="space-y-4">
        <VibeSelector value={selectedVibe} onChange={setSelectedVibe} />
      </div>

      {examples.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            More coming soon — be the first to set the vibe for {VIBE_LABELS[selectedVibe]}.
          </p>
        </div>
      ) : (
        <div
          key={selectedVibe}
          className="columns-2 gap-3 sm:columns-3 lg:columns-4"
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
        </div>
      )}
    </section>
  )
}
