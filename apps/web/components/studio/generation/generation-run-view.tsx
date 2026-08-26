'use client'

import { SystemNotice } from '@/components/common/system-notice'
import { GeneratedImage } from '@/components/studio/generation/generated-image'
import { GeneratedVideo } from '@/components/studio/generation/generated-video'
import { GenerationConnectingSection } from '@/components/studio/generation/generation-connecting-section'
import {
  GenerationFailureAlert,
  GenerationMissingOutputAlert,
} from '@/components/studio/generation/generation-failure-alert'
import { GenerationProgressHeader } from '@/components/studio/generation/generation-progress-header'
import { PipelineStepsSection } from '@/components/studio/generation/pipeline-steps-section'
import { RemixPromptInput } from '@/components/studio/generation/remix-prompt-input'
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
import type { VideoGenerationPayload } from '@socialista/trigger/schemas/video-generation'
import type { ImageGenerationOutput, Model, VideoGenerationOutput } from '@socialista/types'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type GenerationRunViewProps = {
  runId: string
  contentKind: 'image' | 'ad' | 'video'
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

function ImagePromptMetaStrip({
  payload,
  model,
  enhancedPrompt,
}: {
  payload: ImageGenerationPayload
  model?: Model
  enhancedPrompt?: string
}) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
  const referenceUrls =
    payload.imageUrls && payload.imageUrls.length > 0
      ? payload.imageUrls
      : payload.imageUrl
        ? [payload.imageUrl]
        : []
  const numImages = payload.numImages ?? 1
  const showEnhanced = Boolean(enhancedPrompt && enhancedPrompt !== payload.prompt)

  return (
    <div className="space-y-2.5 rounded-xl border border-black/10 bg-black/[0.02] px-3.5 py-3 dark:border-white/12 dark:bg-white/[0.02]">
      <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/90">{payload.prompt}</p>
      {showEnhanced ? (
        <p className="line-clamp-4 text-[12px] leading-relaxed text-black/56 dark:text-white/56">
          <span className="font-medium text-foreground/72">Enhanced · </span>
          {enhancedPrompt}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12">
          {aspectLabel} · {payload.aspectRatio}
        </span>
        {numImages > 1 ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12">
            {numImages} images
          </span>
        ) : null}
        {model ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12">
            {model.name}
          </span>
        ) : null}
        {referenceUrls.length > 0 ? (
          <div className="ml-auto flex">
            {referenceUrls.slice(0, 3).map(url => (
              <div
                key={url}
                className="relative size-8 shrink-0 overflow-hidden rounded-md border border-black/10 bg-black/[0.03] -ml-1 first:ml-0 dark:border-white/12 dark:bg-white/[0.03]"
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

function collectStaticAdReferenceUrls(payload: StaticAdGenerationPayload): string[] {
  if (payload.images && payload.images.length > 0) {
    return payload.images.map(image => image.url)
  }
  const urls: string[] = []
  if (payload.productImage) urls.push(payload.productImage)
  if (payload.referenceImage && !urls.includes(payload.referenceImage)) {
    urls.push(payload.referenceImage)
  }
  return urls
}

function StaticAdPromptMetaStrip({ payload }: { payload: StaticAdGenerationPayload }) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
  const languageLabel =
    payload.language && payload.language !== 'en' ? getLanguageLabel(payload.language) : undefined
  const numImages = payload.numImages ?? 1
  const referenceUrls = collectStaticAdReferenceUrls(payload)

  return (
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
      <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/90">
        {payload.prompt?.trim() || 'No brief notes — inventing from references'}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {aspectLabel} · {payload.aspectRatio}
        </span>
        {numImages > 1 ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {numImages} images
          </span>
        ) : null}
        {languageLabel ? (
          <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {languageLabel}
          </span>
        ) : null}
        {referenceUrls.length > 0 ? (
          <div className="ml-auto flex items-center">
            {referenceUrls.slice(0, 4).map(url => (
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
            {referenceUrls.length > 4 ? (
              <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                +{referenceUrls.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function collectReferenceUrls(payload: VideoGenerationPayload): string[] {
  const urls = [...(payload.imageUrls ?? [])]
  if (payload.imageUrl && !urls.includes(payload.imageUrl)) urls.push(payload.imageUrl)
  return urls
}

function VideoPromptMetaStrip({ payload, model }: { payload: VideoGenerationPayload; model?: Model }) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
  const referenceUrls = collectReferenceUrls(payload)

  return (
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
      <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/90">{payload.prompt}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {aspectLabel} · {payload.aspectRatio}
        </span>
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {payload.duration}s
        </span>
        <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
          {payload.generateAudio ? 'Audio on' : 'Muted'}
        </span>
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
  const [remixImageUrl, setRemixImageUrl] = useState<string | undefined>()
  const activeStepRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const lastScrolledStepRef = useRef<number | null>(null)

  const { run, error } = useGenerationRun({ runId, accessToken })

  const status = useMemo(() => parseGenerationStatus(run?.metadata), [run?.metadata])
  const imageOutput = contentKind !== 'video' ? (run?.output as ImageGenerationOutput | undefined) : undefined
  const videoOutput = contentKind === 'video' ? (run?.output as VideoGenerationOutput | undefined) : undefined
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
  const videoPayload =
    contentKind === 'video' ? (run?.payload as VideoGenerationPayload | undefined) : undefined

  const model = useMemo(
    () => findModel(models, imagePayload?.model ?? adPayload?.model ?? videoPayload?.model),
    [models, imagePayload?.model, adPayload?.model, videoPayload?.model],
  )
  const languageLabel =
    adPayload?.language && adPayload.language !== 'en'
      ? getLanguageLabel(adPayload.language)
      : undefined
  const adReferenceUrls = adPayload ? collectStaticAdReferenceUrls(adPayload) : []

  const enhancedPrompt =
    typeof run?.metadata?.enhancedPrompt === 'string' ? run.metadata.enhancedPrompt : undefined

  const activeStepIndex = useMemo(
    () => computeActiveStepIndex(status.progress, isComplete, isFailed),
    [status.progress, isComplete, isFailed],
  )

  const progressWidth = isComplete || isFailed ? 100 : Math.min(status.progress, 100)
  const aspectRatio = imagePayload?.aspectRatio ?? adPayload?.aspectRatio ?? videoPayload?.aspectRatio
  const hasCompleteOutput = Boolean(imageOutput?.imageUrl || videoOutput?.videoUrl)
  const remixModel = imagePayload?.model ?? adPayload?.model
  const remixWorkspaceId = imagePayload?.workspaceId ?? adPayload?.workspaceId
  const remixProjectId = imagePayload?.projectId ?? adPayload?.projectId

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollBehavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

    if (isComplete && hasCompleteOutput) {
      imageRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' })
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
      metaStrip = (
        <ImagePromptMetaStrip enhancedPrompt={enhancedPrompt} model={model} payload={imagePayload} />
      )
    } else if (adPayload) {
      metaStrip = <StaticAdPromptMetaStrip payload={adPayload} />
    } else if (videoPayload) {
      metaStrip = <VideoPromptMetaStrip model={model} payload={videoPayload} />
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

          {isComplete && !hasCompleteOutput ? (
            <GenerationMissingOutputAlert
              message={
                contentKind === 'video'
                  ? 'The run completed but no video was returned.'
                  : 'The run completed but no image was returned.'
              }
            />
          ) : null}

          {isComplete && imageOutput?.imageUrl ? (
            <>
              <GeneratedImage
                aspectRatio={aspectRatio}
                contentKind={contentKind === 'ad' ? 'ad' : 'image'}
                cost={imageOutput.cost}
                durationMs={run?.durationMs}
                imageRef={imageRef}
                languageLabel={languageLabel}
                modelName={model?.name ?? (contentKind === 'ad' ? 'GPT Image 2' : undefined)}
                newGenerationHref={backHref}
                onSelectedUrlChange={setRemixImageUrl}
                output={imageOutput}
                productImageUrl={
                  adReferenceUrls[0]
                    ? resolveGeneratedImagePreviewUrl(adReferenceUrls[0])
                    : undefined
                }
                prompt={enhancedPrompt ?? imagePayload?.prompt ?? adPayload?.prompt}
              />
              {remixModel && remixWorkspaceId ? (
                <RemixPromptInput
                  aspectRatio={aspectRatio}
                  contentKind={contentKind === 'ad' ? 'ad' : 'image'}
                  imageUrl={remixImageUrl ?? imageOutput.imageUrl}
                  language={adPayload?.language}
                  model={remixModel}
                  projectId={remixProjectId}
                  workspaceId={remixWorkspaceId}
                />
              ) : null}
            </>
          ) : null}

          {isComplete && videoOutput?.videoUrl ? (
            <GeneratedVideo
              aspectRatio={aspectRatio}
              cost={videoOutput.cost}
              durationMs={run?.durationMs}
              durationSec={videoOutput.durationSec ?? videoPayload?.duration}
              generateAudio={videoPayload?.generateAudio}
              modelName={model?.name}
              newGenerationHref={backHref}
              output={videoOutput}
              prompt={videoPayload?.prompt}
              referenceUrls={videoPayload ? collectReferenceUrls(videoPayload) : undefined}
              videoRef={imageRef}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
