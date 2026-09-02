'use client'

import { SystemNotice } from '@/components/common/system-notice'
import { GenerationConnectingSection } from '@/components/studio/generation/generation-connecting-section'
import {
  GenerationFailureAlert,
  GenerationMissingOutputAlert,
} from '@/components/studio/generation/generation-failure-alert'
import { GenerationProgressHeader } from '@/components/studio/generation/generation-progress-header'
import { PipelineStepsSection } from '@/components/studio/generation/pipeline-steps-section'
import { Button } from '@/components/ui/button'
import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import {
  computeActiveStepIndex,
  parseGenerationStatus,
  parseMetadataError,
  resolveFailureMessage,
} from '@/lib/image-generation/run-utils'
import { readGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import type { SlideshowGenerationPayload } from '@socialista/trigger/schemas/slideshow-generation'
import type { SlideshowGenerationOutput } from '@socialista/types'
import { ArrowLeftIcon, ImagesIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

type SlideshowGenerationRunViewProps = {
  runId: string
}

export function SlideshowGenerationRunView({ runId }: SlideshowGenerationRunViewProps) {
  const backHref = DASHBOARD_ROUTES.STUDIO.SLIDESHOWS
  const [accessToken] = useState(() => readGenerationAccessToken(runId))
  const previewRef = useRef<HTMLDivElement>(null)
  const activeStepRef = useRef<HTMLDivElement>(null)
  const lastScrolledStepRef = useRef<number | null>(null)

  const { run, error } = useGenerationRun({ runId, accessToken })

  const status = useMemo(() => parseGenerationStatus(run?.metadata), [run?.metadata])
  const output = run?.output as SlideshowGenerationOutput | undefined
  const payload = run?.payload as SlideshowGenerationPayload | undefined
  const metadataError = useMemo(() => parseMetadataError(run?.metadata), [run?.metadata])
  const failureMessage = useMemo(() => resolveFailureMessage(run), [run])

  const isComplete = COMPLETED_STATUSES.has(run?.status ?? '')
  const isFailed =
    FAILED_STATUSES.has(run?.status ?? '') ||
    Boolean(run?.error) ||
    Boolean(metadataError) ||
    status.label === 'Generation failed'
  const isRunning = Boolean(run) && !isComplete && !isFailed
  const isConnecting = !isRunning && !isComplete && !isFailed
  const hasCompleteOutput = Boolean(output?.slideshowId)
  const previewUrl = output?.imageUrl ? resolveGeneratedImagePreviewUrl(output.imageUrl) : undefined
  const activeStepIndex = useMemo(
    () => computeActiveStepIndex(status.progress, isComplete, isFailed),
    [status.progress, isComplete, isFailed],
  )
  const progressWidth = isComplete || isFailed ? 100 : Math.min(status.progress, 100)

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollBehavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

    if (isComplete && hasCompleteOutput) {
      previewRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' })
      return
    }

    if ((isRunning || isFailed) && lastScrolledStepRef.current !== activeStepIndex) {
      lastScrolledStepRef.current = activeStepIndex
      activeStepRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' })
    }
  }, [activeStepIndex, hasCompleteOutput, isComplete, isFailed, isRunning])

  if (!accessToken) {
    return (
      <SystemNotice
        action={
          <Button asChild size="sm" variant="outline">
            <Link href={backHref}>
              <ArrowLeftIcon className="size-3.5" />
              Back to slideshows
            </Link>
          </Button>
        }
        description="Start a new generation to watch progress in real time."
        title="Session expired"
      />
    )
  }

  if (error && !run) {
    return (
      <SystemNotice
        action={
          <Button asChild size="sm" variant="outline">
            <Link href={backHref}>Back to slideshows</Link>
          </Button>
        }
        description={error.message}
        title="Unable to load generation"
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <GenerationProgressHeader
        backHref={backHref}
        isComplete={isComplete}
        isFailed={isFailed}
        isRunning={isRunning}
        progress={status.progress}
        progressWidth={progressWidth}
      />

      <div
        aria-atomic="true"
        aria-live="polite"
        className={cn(
          'mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6',
          isComplete ? 'py-4 sm:py-5' : 'py-6 sm:py-8',
        )}
      >
        <div className={cn(isComplete ? 'space-y-4' : 'space-y-5')}>
          {!isComplete && payload?.prompt ? (
            <div className="space-y-2.5 rounded-xl bg-black/[0.03] px-3.5 py-3 dark:bg-white/[0.04]">
              <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground">{payload.prompt}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[12px] text-muted-foreground">
                  {payload.slideCount != null ? `${payload.slideCount} slides` : 'Auto length'}
                </span>
              </div>
            </div>
          ) : null}

          {isRunning || isConnecting ? (
            <GenerationConnectingSection
              headingId="slideshow-generation-preview-heading"
              isConnecting={isConnecting}
              statusLabel={status.label}
              title="Generating slideshow"
            />
          ) : null}

          {isRunning && run ? (
            <PipelineStepsSection
              activeStepIndex={activeStepIndex}
              activeStepRef={activeStepRef}
              headingId="slideshow-generation-progress-heading"
              progress={status.progress}
              statusLabel={status.label}
            />
          ) : null}

          {isFailed ? (
            <GenerationFailureAlert
              message={failureMessage}
              retryHref={backHref}
              retryLabel="Try another prompt"
            />
          ) : null}

          {isComplete && !hasCompleteOutput ? (
            <GenerationMissingOutputAlert message="The run completed but no slideshow was created." />
          ) : null}

          {isComplete && output?.slideshowId ? (
            <div ref={previewRef} className="space-y-4">
              <div className="overflow-hidden rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                {previewUrl ? (
                  <div className="relative aspect-[4/5] w-full bg-black/4">
                    <Image
                      alt="Generated slideshow preview"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 640px"
                      src={previewUrl}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center text-muted-foreground">
                    <ImagesIcon className="size-8" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="h-9 rounded-lg">
                  <Link href={DASHBOARD_ROUTES.STUDIO.slideshow(output.slideshowId)}>Open in editor</Link>
                </Button>
                <Button asChild className="h-9 rounded-lg" variant="outline">
                  <Link href={backHref}>Back to slideshows</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
