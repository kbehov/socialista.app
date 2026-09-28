'use client'

import { GenerationWaitingStatus } from '@/components/studio/generation/generation-waiting-status'
import { Matrix, pulse } from '@/components/matrix'
import { Spinner } from '@/components/ui/spinner'
import type { GenerationWaitingKind } from '@/constants/generation-waiting.const'

const MATRIX_ARIA: Record<GenerationWaitingKind, string> = {
  image: 'Generating image',
  video: 'Generating video',
  ad: 'Generating static ad',
}

const MATRIX_HEADING: Record<GenerationWaitingKind, { connecting: string; generating: string }> = {
  image: { connecting: 'Connecting to image generation', generating: 'Generating image' },
  video: { connecting: 'Connecting to video generation', generating: 'Generating video' },
  ad: { connecting: 'Connecting to ad generation', generating: 'Generating static ad' },
}

type GenerationMatrixPlaceholderProps = {
  contentKind: GenerationWaitingKind
  headingId: string
  isConnecting: boolean
  statusLabel: string
}

export function GenerationMatrixPlaceholder({
  contentKind,
  headingId,
  isConnecting,
  statusLabel,
}: GenerationMatrixPlaceholderProps) {
  const headings = MATRIX_HEADING[contentKind]

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col items-center justify-center px-2 pt-8 pb-2 sm:pt-12 sm:pb-4"
    >
      <h2 id={headingId} className="sr-only">
        {isConnecting ? headings.connecting : headings.generating}
      </h2>

      <div className="flex w-full flex-col items-center">
        {isConnecting ? (
          <Spinner className="size-5 text-black/40 dark:text-white/40" />
        ) : (
          <Matrix
            ariaLabel={MATRIX_ARIA[contentKind]}
            className="text-foreground/90"
            cols={7}
            fps={14}
            frames={pulse}
            gap={7}
            loop
            palette={{
              on: 'currentColor',
              off: 'var(--muted-foreground)',
            }}
            rows={7}
            size={22}
          />
        )}

        <GenerationWaitingStatus
          key={`${contentKind}-${isConnecting ? 'connecting' : 'generating'}`}
          contentKind={contentKind}
          isConnecting={isConnecting}
          statusLabel={statusLabel}
        />
      </div>
    </section>
  )
}
