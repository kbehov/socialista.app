'use client'

import { SystemNotice } from '@/components/common/system-notice'
import { Button } from '@/components/ui/button'
import { ASPECT_RATIO_LABELS, COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getLanguageLabel } from '@/components/ui/language-selector'
import { useStaticAdGenerationRun } from '@/hooks/use-static-ad-generation-run'
import { resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import {
  computeActiveStepIndex,
  parseGenerationStatus,
  parseMetadataError,
  resolveFailureMessage,
} from '@/lib/image-generation/run-utils'
import { readGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import type { ImageGenerationOutput } from '@socialista/types'
import type { StaticAdGenerationPayload } from '@socialista/trigger/schemas/static-ad'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GeneratedImage } from '../../_components/generation/generated-image'
import { GenerationConnectingSection } from '../../_components/generation/generation-connecting-section'
import {
  GenerationFailureAlert,
  GenerationMissingOutputAlert,
} from '../../_components/generation/generation-failure-alert'
import { GenerationProgressHeader } from '../../_components/generation/generation-progress-header'
import { PipelineStepsSection } from '../../_components/generation/pipeline-steps-section'

const STATIC_ADS_HREF = DASHBOARD_ROUTES.STUDIO.STATIC_ADS

type StaticAdGenerationProgressProps = {
  runId: string
}

function PromptMetaStrip({ payload }: { payload: StaticAdGenerationPayload }) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
  const languageLabel =
    payload.language && payload.language !== 'en' ? getLanguageLabel(payload.language) : undefined

  return (
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
      <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/90">
        {payload.prompt?.trim() || 'No brief notes — inventing from product image'}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {aspectLabel} · {payload.aspectRatio}
        </span>
        {languageLabel ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {languageLabel}
          </span>
        ) : null}
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          GPT Image 2
        </span>
        {payload.productImage ? (
          <div className="ml-auto flex">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/30">
              <Image
                alt="Product reference"
                className="object-cover"
                fill
                sizes="32px"
                src={resolveGeneratedImagePreviewUrl(payload.productImage)}
                unoptimized
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function StaticAdGenerationProgress({ runId }: StaticAdGenerationProgressProps) {
  const [accessToken] = useState(() => readGenerationAccessToken(runId))
  const activeStepRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const lastScrolledStepRef = useRef<number | null>(null)

  const { run, error } = useStaticAdGenerationRun({ runId, accessToken })

  const status = useMemo(() => parseGenerationStatus(run?.metadata), [run?.metadata])
  const output = run?.output as ImageGenerationOutput | undefined
  const payload = run?.payload as StaticAdGenerationPayload | undefined
  const metadataError = useMemo(() => parseMetadataError(run?.metadata), [run?.metadata])
  const failureMessage = useMemo(() => resolveFailureMessage(run), [run])
  const languageLabel =
    payload?.language && payload.language !== 'en' ? getLanguageLabel(payload.language) : undefined

  const isComplete = COMPLETED_STATUSES.has(run?.status ?? '')
  const isFailed =
    FAILED_STATUSES.has(run?.status ?? '') ||
    Boolean(run?.error) ||
    Boolean(metadataError) ||
    status.label === 'Generation failed'
  const isRunning = Boolean(run) && !isComplete && !isFailed
  const isConnecting = !isRunning && !isComplete && !isFailed

  const activeStepIndex = useMemo(
    () => computeActiveStepIndex(status.progress, isComplete, isFailed),
    [status.progress, isComplete, isFailed],
  )

  const progressWidth = isComplete || isFailed ? 100 : Math.min(status.progress, 100)

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollBehavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

    if (isComplete && output?.imageUrl) {
      imageRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' })
      return
    }

    if ((isRunning || isFailed) && lastScrolledStepRef.current !== activeStepIndex) {
      lastScrolledStepRef.current = activeStepIndex
      activeStepRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' })
    }
  }, [activeStepIndex, isComplete, isFailed, isRunning, output?.imageUrl])

  if (!accessToken) {
    return (
      <SystemNotice
        action={
          <Button asChild size="sm" variant="outline">
            <Link href={STATIC_ADS_HREF}>
              <ArrowLeftIcon className="size-3.5" />
              Back to static ads
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
            <Link href={STATIC_ADS_HREF}>Back to static ads</Link>
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
        backHref={STATIC_ADS_HREF}
        isComplete={isComplete}
        isFailed={isFailed}
        isRunning={isRunning}
        progress={status.progress}
        progressWidth={progressWidth}
      />

      <div
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6',
          isComplete ? 'py-4 sm:py-5' : 'py-6 sm:py-8',
        )}
      >
        <div className={cn(isComplete ? 'space-y-4' : 'space-y-5')}>
          {payload && !isComplete ? <PromptMetaStrip payload={payload} /> : null}

          {isRunning || isConnecting ? (
            <GenerationConnectingSection
              aspectRatio={payload?.aspectRatio}
              headingId="static-ad-preview-heading"
              isConnecting={isConnecting}
              statusLabel={status.label}
              title="Generating static ad"
            />
          ) : null}

          {isRunning && run ? (
            <PipelineStepsSection
              activeStepIndex={activeStepIndex}
              activeStepRef={activeStepRef}
              headingId="static-ad-progress-heading"
              progress={status.progress}
              statusLabel={status.label}
            />
          ) : null}

          {isFailed ? (
            <GenerationFailureAlert
              message={failureMessage}
              retryHref={STATIC_ADS_HREF}
              retryLabel="Create another ad"
            />
          ) : null}

          {isComplete && !output?.imageUrl ? <GenerationMissingOutputAlert /> : null}

          {isComplete && output?.imageUrl ? (
            <GeneratedImage
              aspectRatio={payload?.aspectRatio}
              contentKind="ad"
              cost={output.cost}
              durationMs={run?.durationMs}
              imageRef={imageRef}
              languageLabel={languageLabel}
              modelName="GPT Image 2"
              newGenerationHref={STATIC_ADS_HREF}
              output={output}
              productImageUrl={
                payload?.productImage
                  ? resolveGeneratedImagePreviewUrl(payload.productImage)
                  : undefined
              }
              prompt={payload?.prompt}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
