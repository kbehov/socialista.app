'use client'

import { Shimmer } from '@/components/ai-elements/shimmer'
import { SystemNotice } from '@/components/common/system-notice'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ASPECT_RATIO_LABELS, COMPLETED_STATUSES, FAILED_STATUSES, PIPELINE_STEPS } from '@/constants/generation.const'
import { extractErrorMessage, formatGenerationError } from '@/lib/image-generation/format-error'
import { resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { readGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import type { ImageGenerationOutput, ImageGenerationPayload, ImageGenerationStatus } from '@socialista/trigger'
import type { Model } from '@socialista/types'
import { AlertCircleIcon, ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGenerationRun } from '../../../../../../../hooks/use-generation-run'
import { GeneratedImage } from '../../_components/generated-image'
import { PipelineStep } from '../../_components/pipeline-step'
type GenerationProgressProps = {
  runId: string
  models: Model[]
}

function parseMetadataError(metadata: Record<string, unknown> | undefined): string | undefined {
  const error = metadata?.error
  if (typeof error === 'string') {
    return formatGenerationError(error)
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message
    if (typeof message === 'string') {
      return formatGenerationError(message)
    }
  }
  return undefined
}

function resolveFailureMessage(run: { error?: unknown; metadata?: Record<string, unknown> } | undefined): string {
  if (run?.error) {
    return extractErrorMessage(run.error)
  }

  const metadataError = parseMetadataError(run?.metadata)
  if (metadataError) {
    return metadataError
  }

  return 'The generation run did not complete.'
}

function parseStatus(metadata: Record<string, unknown> | undefined): ImageGenerationStatus {
  const status = metadata?.status as Partial<ImageGenerationStatus> | undefined
  if (status && typeof status.progress === 'number' && typeof status.label === 'string') {
    return { progress: status.progress, label: status.label }
  }
  return { progress: 5, label: 'Starting generation…' }
}

function findModel(models: Model[], value: string | undefined): Model | undefined {
  if (!value) return undefined
  return models.find(model => model.value === value)
}

function stepState(
  progress: number,
  threshold: number,
  nextThreshold: number | undefined,
  isComplete: boolean,
): 'complete' | 'active' | 'pending' {
  if (isComplete) return 'complete'
  if (progress >= (nextThreshold ?? 100)) return 'complete'
  if (progress >= threshold) return 'active'
  return 'pending'
}

function PromptContext({ payload, model }: { payload: ImageGenerationPayload; model?: Model }) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="text-[14px] leading-relaxed text-foreground">{payload.prompt}</p>
      {payload.imageUrl ? (
        <div className="relative mt-3 aspect-square w-full max-w-[140px] overflow-hidden rounded-lg border border-border/60 bg-muted/30">
          <Image
            alt="Reference"
            className="object-cover"
            fill
            sizes="140px"
            src={resolveGeneratedImagePreviewUrl(payload.imageUrl)}
            unoptimized
          />
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {aspectLabel} · {payload.aspectRatio}
        </span>
        {model ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {model.name}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function RunStatusBadge({
  isComplete,
  isFailed,
  isRunning,
  progress,
}: {
  isComplete: boolean
  isFailed: boolean
  isRunning: boolean
  progress: number
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums',
        isComplete && 'bg-foreground text-background',
        isFailed && 'bg-destructive/10 text-destructive',
        isRunning && 'bg-muted text-foreground',
        !isComplete && !isFailed && !isRunning && 'bg-muted text-muted-foreground',
      )}
    >
      {isComplete ? 'Complete' : isFailed ? 'Failed' : isRunning ? `${Math.round(progress)}%` : 'Connecting'}
    </span>
  )
}

export function GenerationProgress({ runId, models }: GenerationProgressProps) {
  const [accessToken] = useState(() => readGenerationAccessToken(runId))
  const activeStepRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const { run, error } = useGenerationRun({ runId, accessToken })

  const status = useMemo(() => parseStatus(run?.metadata), [run?.metadata])
  const output = run?.output as ImageGenerationOutput | undefined
  const payload = run?.payload as ImageGenerationPayload | undefined
  const metadataError = useMemo(() => parseMetadataError(run?.metadata), [run?.metadata])
  const failureMessage = useMemo(() => resolveFailureMessage(run), [run])

  const isComplete = COMPLETED_STATUSES.has(run?.status ?? '')
  const isFailed =
    FAILED_STATUSES.has(run?.status ?? '') ||
    Boolean(run?.error) ||
    Boolean(metadataError) ||
    status.label === 'Generation failed'
  const isRunning = Boolean(run) && !isComplete && !isFailed

  const model = useMemo(() => findModel(models, payload?.model), [models, payload?.model])

  const activeStepIndex = useMemo(() => {
    if (isComplete) return PIPELINE_STEPS.length - 1
    if (isFailed) {
      for (let i = PIPELINE_STEPS.length - 1; i >= 0; i--) {
        if (status.progress >= PIPELINE_STEPS[i].threshold) return i
      }
      return 0
    }
    for (let i = PIPELINE_STEPS.length - 1; i >= 0; i--) {
      if (status.progress >= PIPELINE_STEPS[i].threshold) return i
    }
    return 0
  }, [status.progress, isComplete, isFailed])

  const progressWidth = isComplete || isFailed ? 100 : Math.min(status.progress, 100)

  useEffect(() => {
    const scrollTo = (node: HTMLElement | null, block: ScrollLogicalPosition) => {
      if (!node) return
      node.scrollIntoView({ behavior: 'smooth', block })
    }

    if (isComplete && output?.imageUrl) {
      scrollTo(imageRef.current, 'nearest')
      return
    }

    if (isRunning || isFailed) {
      scrollTo(activeStepRef.current, 'nearest')
    }
  }, [status.progress, status.label, isComplete, isFailed, output?.imageUrl, isRunning, activeStepIndex])

  if (!accessToken) {
    return (
      <SystemNotice
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/studio/images">
              <ArrowLeftIcon className="size-3.5" />
              Back to studio
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
            <Link href="/dashboard/studio/images">Back to studio</Link>
          </Button>
        }
        description={error.message}
        title="Unable to load generation"
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Button asChild className="h-8 gap-1.5 px-2 text-muted-foreground" size="sm" variant="ghost">
            <Link href="/dashboard/studio/images">
              <ArrowLeftIcon className="size-3.5" />
              <span className="text-[13px]">Back</span>
            </Link>
          </Button>

          <RunStatusBadge
            isComplete={isComplete}
            isFailed={isFailed}
            isRunning={isRunning}
            progress={status.progress}
          />
        </div>

        <div className="h-0.5 w-full bg-muted/60">
          <div
            className={cn(
              'h-full transition-[width] duration-500 ease-out',
              isFailed ? 'bg-destructive' : 'bg-foreground',
            )}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </header>

      <div
        className={cn('mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6', isComplete ? 'py-4 sm:py-5' : 'py-8 sm:py-10')}
      >
        <div className={cn(isComplete ? 'space-y-4' : 'space-y-8')}>
          {payload && !isComplete ? <PromptContext model={model} payload={payload} /> : null}

          {isRunning && run ? (
            <section className="space-y-4" aria-labelledby="generation-progress-heading">
              <div className="space-y-1">
                <h2
                  id="generation-progress-heading"
                  className="text-[15px] font-semibold tracking-[-0.01em] text-foreground"
                >
                  Generating
                </h2>
                <p className="text-sm text-muted-foreground">
                  <Shimmer as="span">{status.label}</Shimmer>
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-background p-4">
                {PIPELINE_STEPS.map((step, index) => {
                  const nextThreshold = PIPELINE_STEPS[index + 1]?.threshold
                  const state = stepState(status.progress, step.threshold, nextThreshold, false)
                  const isActive = index === activeStepIndex

                  return (
                    <PipelineStep
                      key={step.id}
                      detail={isActive ? status.label : undefined}
                      isLast={index === PIPELINE_STEPS.length - 1}
                      label={step.label}
                      state={state}
                      stepRef={isActive ? activeStepRef : undefined}
                    />
                  )
                })}
              </div>
            </section>
          ) : null}

          {!isRunning && !isComplete && !isFailed ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Connecting to your generation…
            </div>
          ) : null}

          {isFailed ? (
            <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-destructive">Generation failed</p>
                    <p className="mt-1 text-sm leading-relaxed text-destructive/80">{failureMessage}</p>
                  </div>
                  <Button asChild className="h-8 text-xs" size="sm" variant="outline">
                    <Link href="/dashboard/studio/images">Try another prompt</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {isComplete && !output?.imageUrl ? (
            <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">The run completed but no image was returned.</p>
              </div>
            </div>
          ) : null}

          {isComplete && output?.imageUrl ? (
            <GeneratedImage
              aspectRatio={payload?.aspectRatio}
              cost={output.cost}
              durationMs={run?.durationMs}
              imageRef={imageRef}
              output={output}
              prompt={payload?.prompt}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
