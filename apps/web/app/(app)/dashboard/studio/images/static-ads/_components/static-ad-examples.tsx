'use client'

import { cn } from '@/lib/utils'
import { getAspectRatioClass } from '@/utils/aspect-ratio'
import { commitHaptic } from '@/utils/haptics'
import { useCopyPrompt } from '@/hooks/use-copy-prompt'
import { CopyIcon, SparklesIcon, WandSparklesIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { STATIC_AD_EXAMPLES, type StaticAdExample } from '../_lib/examples'
import { useStaticAdStudio } from './static-ad-studio-provider'

function ExampleCard({
  example,
  isActive,
  onRemix,
  onCopy,
}: {
  example: StaticAdExample
  isActive: boolean
  onRemix: () => void
  onCopy: () => void
}) {
  return (
    <li
      className={cn(
        'overflow-hidden rounded-xl border border-border/50 bg-background',
        isActive && 'ring-2 ring-foreground/25 ring-offset-2 ring-offset-background',
      )}
    >
      <div className={cn('relative w-full bg-muted/30', getAspectRatioClass(example.aspectRatio))}>
        <Image
          alt={example.title}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          src={example.imageUrl}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-1 p-2">
          {example.trending ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-black backdrop-blur-sm">
              <SparklesIcon className="size-3" />
              Popular
            </span>
          ) : null}
          <span className="rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            {example.aspectRatio}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 p-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium tracking-[-0.01em] text-foreground">
            {example.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {example.hook}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              commitHaptic({ vibrateDuration: 8 })
              onRemix()
              toast.message('Creative direction applied', {
                description: 'Add your product image — example previews are for inspiration only.',
              })
            }}
            className={cn(
              'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 text-[12px] font-medium text-background',
              'transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            )}
          >
            <WandSparklesIcon className="size-3.5" />
            Remix
          </button>

          <button
            type="button"
            onClick={onCopy}
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground',
              'hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              'active:scale-[0.97]',
            )}
            aria-label={`Copy prompt for ${example.title}`}
          >
            <CopyIcon className="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  )
}

export function StaticAdExamples() {
  const { activeExampleId, remixExample } = useStaticAdStudio()
  const { copyPrompt } = useCopyPrompt()

  return (
    <section className="space-y-5" aria-labelledby="static-ad-examples-heading">
      <div className="space-y-1">
        <h2
          id="static-ad-examples-heading"
          className="text-base font-semibold tracking-[-0.01em] text-foreground"
        >
          Example ads
        </h2>
        <p className="text-sm text-muted-foreground">
          Remix applies creative direction only — use your own product image for the hero.
        </p>
      </div>

      <ul
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Static ad example gallery"
      >
        {STATIC_AD_EXAMPLES.map(example => (
          <ExampleCard
            key={example.id}
            example={example}
            isActive={activeExampleId === example.id}
            onRemix={() => remixExample(example)}
            onCopy={() => void copyPrompt(example.prompt, 'Prompt copied')}
          />
        ))}
      </ul>
    </section>
  )
}
