'use client'

import { SystemNotice } from '@/components/common/system-notice'
import { GeneratedImage } from '@/components/studio/generation/generated-image'
import { GenerationConnectingSection } from '@/components/studio/generation/generation-connecting-section'
import {
  GenerationFailureAlert,
  GenerationMissingOutputAlert,
} from '@/components/studio/generation/generation-failure-alert'
import { GenerationProgressHeader } from '@/components/studio/generation/generation-progress-header'
import { PipelineStepsSection } from '@/components/studio/generation/pipeline-steps-section'
import { Button } from '@/components/ui/button'
import { getLanguageLabel } from '@/components/ui/language-selector'
import { ASPECT_RATIO_LABELS, COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
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
import type { ImageGenerationPayload } from '@socialista/trigger/schemas/image-generation'
import type { StaticAdGenerationPayload } from '@socialista/trigger/schemas/static-ad'
import type { ImageGenerationOutput, Model } from '@socialista/types'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type GenerationRunViewProps = {
  runId: string
  contentKind: 'image' | 'ad'
  backHref: string
  studioLabel: string
  generatingTitle: string
  retryLabel: string
  previewHeadingId: string
  progressHeadingId: string
  models?: Model[]
}

function findModel(models: Model[] | undefined, value: string | undefined): Model | undefined {
  if (!models || !value) return undefined
  return models.find(model => model.value === value)
}

function ImagePromptMetaStrip({ payload, model }: { payload: ImageGenerationPayload; model?: Model }) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
  const referenceUrls =
    payload.imageUrls && payload.imageUrls.length > 0
      ? payload.imageUrls
      : payload.imageUrl
        ? [payload.imageUrl]
        : []
  const numImages = payload.numImages ?? 1

  return (
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
      <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/90">{payload.prompt}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {aspectLabel} · {payload.aspectRatio}
        </span>
        {numImages > 1 ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {numImages} images
          </span>
        ) : null}
        {model ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {model.name}
          </span>
        ) : null}
        {referenceUrls.length > 0 ? (
          <div className="ml-auto flex">
            {referenceUrls.slice(0, 3).map(url => (
              <div
                key={url}
                className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/30 -ml-1 first:ml-0"
              >
                <Image
                  alt="Reference"
                  className="object-cover"
                  fill
                  sizes="32px"
                  src={resolveGeneratedImagePreviewUrl(url)}
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function StaticAdPromptMetaStrip({ payload }: { payload: StaticAdGenerationPayload }) {
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

export function GenerationRunView({
  runId,
  contentKind,
  backHref,
  studioLabel,
  generatingTitle,
  retryLabel,
  previewHeadingId,
  progressHeadingId,
  models,
}: GenerationRunViewProps) {
  const [accessToken] = useState(() => readGenerationAccessToken(runId))
  const activeStepRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const lastScrolledStepRef = useRef<number | null>(null)

  const { run, error } = useGenerationRun({ runId, accessToken })

  const status = useMemo(() => parseGenerationStatus(run?.metadata), [run?.metadata])
  const output = run?.output as ImageGenerationOutput | undefined
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

  const imagePayload =
    contentKind === 'image' ? (run?.payload as ImageGenerationPayload | undefined) : undefined
  const adPayload =
    contentKind === 'ad' ? (run?.payload as StaticAdGenerationPayload | undefined) : undefined

  const model = useMemo(
    () => findModel(models, imagePayload?.model),
    [models, imagePayload?.model],
  )
  const languageLabel =
    adPayload?.language && adPayload.language !== 'en'
      ? getLanguageLabel(adPayload.language)
      : undefined

  const activeStepIndex = useMemo(
    () => computeActiveStepIndex(status.progress, isComplete, isFailed),
    [status.progress, isComplete, isFailed],
  )

  const progressWidth = isComplete || isFailed ? 100 : Math.min(status.progress, 100)
  const aspectRatio = imagePayload?.aspectRatio ?? adPayload?.aspectRatio

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
            <Link href={backHref}>
              <ArrowLeftIcon className="size-3.5" />
              Back to {studioLabel}
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
            <Link href={backHref}>Back to {studioLabel}</Link>
          </Button>
        }
        description={error.message}
        title="Unable to load generation"
      />
    )
  }

  let metaStrip: ReactNode = null
  if (!isComplete) {
    if (imagePayload) {
      metaStrip = <ImagePromptMetaStrip model={model} payload={imagePayload} />
    } else if (adPayload) {
      metaStrip = <StaticAdPromptMetaStrip payload={adPayload} />
    }
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
          {metaStrip}

          {isRunning || isConnecting ? (
            <GenerationConnectingSection
              aspectRatio={aspectRatio}
              headingId={previewHeadingId}
              isConnecting={isConnecting}
              statusLabel={status.label}
              title={generatingTitle}
            />
          ) : null}

          {isRunning && run ? (
            <PipelineStepsSection
              activeStepIndex={activeStepIndex}
              activeStepRef={activeStepRef}
              headingId={progressHeadingId}
              progress={status.progress}
              statusLabel={status.label}
            />
          ) : null}

          {isFailed ? (
            <GenerationFailureAlert
              message={failureMessage}
              retryHref={backHref}
              retryLabel={retryLabel}
            />
          ) : null}

          {isComplete && !output?.imageUrl ? <GenerationMissingOutputAlert /> : null}

          {isComplete && output?.imageUrl ? (
            <GeneratedImage
              aspectRatio={aspectRatio}
              contentKind={contentKind}
              cost={output.cost}
              durationMs={run?.durationMs}
              imageRef={imageRef}
              languageLabel={languageLabel}
              modelName={contentKind === 'ad' ? 'GPT Image 2' : model?.name}
              newGenerationHref={backHref}
              output={output}
              productImageUrl={
                adPayload?.productImage
                  ? resolveGeneratedImagePreviewUrl(adPayload.productImage)
                  : undefined
              }
              prompt={imagePayload?.prompt ?? adPayload?.prompt}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
