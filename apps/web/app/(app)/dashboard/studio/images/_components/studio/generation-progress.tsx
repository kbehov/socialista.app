'use client'

import { SystemNotice } from '@/components/common/system-notice'
import { Button } from '@/components/ui/button'
import { ASPECT_RATIO_LABELS, COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
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
import type { ImageGenerationOutput } from '@socialista/types'
import type { ImageGenerationPayload } from '@socialista/trigger/schemas/image-generation'
import type { Model } from '@socialista/types'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GeneratedImage } from '../generation/generated-image'
import { GenerationConnectingSection } from '../generation/generation-connecting-section'
import {
  GenerationFailureAlert,
  GenerationMissingOutputAlert,
} from '../generation/generation-failure-alert'
import { GenerationProgressHeader } from '../generation/generation-progress-header'
import { PipelineStepsSection } from '../generation/pipeline-steps-section'

const STUDIO_HREF = DASHBOARD_ROUTES.STUDIO.IMAGES

type GenerationProgressProps = {
  runId: string
  models: Model[]
}

function findModel(models: Model[], value: string | undefined): Model | undefined {
  if (!value) return undefined
  return models.find(model => model.value === value)
}

function PromptMetaStrip({ payload, model }: { payload: ImageGenerationPayload; model?: Model }) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio

  return (
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
      <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/90">{payload.prompt}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {aspectLabel} · {payload.aspectRatio}
        </span>
        {model ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {model.name}
          </span>
        ) : null}
        {payload.imageUrl ? (
          <div className="relative ml-auto size-8 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/30">
            <Image
              alt="Reference"
              className="object-cover"
              fill
              sizes="32px"
              src={resolveGeneratedImagePreviewUrl(payload.imageUrl)}
              unoptimized
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function GenerationProgress({ runId, models }: GenerationProgressProps) {
  const [accessToken] = useState(() => readGenerationAccessToken(runId))
  const activeStepRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const lastScrolledStepRef = useRef<number | null>(null)

  const { run, error } = useGenerationRun({ runId, accessToken })

  const status = useMemo(() => parseGenerationStatus(run?.metadata), [run?.metadata])
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
  const isConnecting = !isRunning && !isComplete && !isFailed

  const model = useMemo(() => findModel(models, payload?.model), [models, payload?.model])

  const activeStepIndex = useMemo(
    () => computeActiveStepIndex(status.progress, isComplete, isFailed),
    [status.progress, isComplete, isFailed],
  )

  const progressWidth = isComplete || isFailed ? 100 : Math.min(status.progress, 100)

  useEffect(() => {
    if (isComplete && output?.imageUrl) {
      imageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }

    if ((isRunning || isFailed) && lastScrolledStepRef.current !== activeStepIndex) {
      lastScrolledStepRef.current = activeStepIndex
      activeStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeStepIndex, isComplete, isFailed, isRunning, output?.imageUrl])

  if (!accessToken) {
    return (
      <SystemNotice
        action={
          <Button asChild size="sm" variant="outline">
            <Link href={STUDIO_HREF}>
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
            <Link href={STUDIO_HREF}>Back to studio</Link>
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
        backHref={STUDIO_HREF}
        isComplete={isComplete}
        isFailed={isFailed}
        isRunning={isRunning}
        progress={status.progress}
        progressWidth={progressWidth}
      />

      <div
        className={cn('mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6', isComplete ? 'py-4 sm:py-5' : 'py-6 sm:py-8')}
      >
        <div className={cn(isComplete ? 'space-y-4' : 'space-y-5')}>
          {payload && !isComplete ? <PromptMetaStrip model={model} payload={payload} /> : null}

          {isRunning || isConnecting ? (
            <GenerationConnectingSection
              aspectRatio={payload?.aspectRatio}
              headingId="generation-preview-heading"
              isConnecting={isConnecting}
              statusLabel={status.label}
              title="Generating"
            />
          ) : null}

          {isRunning && run ? (
            <PipelineStepsSection
              activeStepIndex={activeStepIndex}
              activeStepRef={activeStepRef}
              headingId="generation-progress-heading"
              progress={status.progress}
              statusLabel={status.label}
            />
          ) : null}

          {isFailed ? (
            <GenerationFailureAlert
              message={failureMessage}
              retryHref={STUDIO_HREF}
              retryLabel="Try another prompt"
            />
          ) : null}

          {isComplete && !output?.imageUrl ? <GenerationMissingOutputAlert /> : null}

          {isComplete && output?.imageUrl ? (
            <GeneratedImage
              aspectRatio={payload?.aspectRatio}
              cost={output.cost}
              durationMs={run?.durationMs}
              imageRef={imageRef}
              modelName={model?.name}
              output={output}
              prompt={payload?.prompt}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
