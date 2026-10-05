'use client'

import { SystemNotice } from '@/components/common/system-notice'
import { GeneratedImage } from '@/components/studio/generation/generated-image'
import { GeneratedVideo } from '@/components/studio/generation/generated-video'
import {
  GenerationFailureAlert,
  GenerationMissingOutputAlert,
} from '@/components/studio/generation/generation-failure-alert'
import { GenerationMatrixPlaceholder } from '@/components/studio/generation/generation-matrix-placeholder'
import { GenerationPipelineSection } from '@/components/studio/generation/generation-pipeline-section'
import { GenerationProgressHeader } from '@/components/studio/generation/generation-progress-header'
import { GenerationWaitingTips } from '@/components/studio/generation/generation-waiting-tips'
import {
  collectStaticAdReferenceUrls,
  collectVideoReferenceUrls,
  GenerationRunPromptBrief,
} from '@/components/studio/generation/generation-run-prompt-brief'
import { RemixPromptInput } from '@/components/studio/generation/remix-prompt-input'
import { Button } from '@/components/ui/button'
import { getLanguageLabel } from '@/components/ui/language-selector'
import type { GenerationWaitingKind } from '@/constants/generation-waiting.const'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { COMPLETED_STATUSES, FAILED_STATUSES } from '@/constants/generation.const'
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
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type GenerationRunViewProps = {
  runId: string
  contentKind: GenerationWaitingKind
  backHref: string
  studioLabel: string
  retryLabel: string
  previewHeadingId: string
  progressHeadingId: string
  models?: Model[]
}

function findModel(models: Model[] | undefined, value: string | undefined): Model | undefined {
  if (!models || !value) return undefined
  return models.find(model => model.value === value)
}

export function GenerationRunView({
  runId,
  contentKind,
  backHref,
  studioLabel,
  retryLabel,
  previewHeadingId,
  progressHeadingId,
  models,
}: GenerationRunViewProps) {
  const [accessToken] = useState(() => readGenerationAccessToken(runId))
  const [remixImageUrl, setRemixImageUrl] = useState<string | undefined>()
  const outputRef = useRef<HTMLDivElement>(null)
  const activeStepRef = useRef<HTMLDivElement>(null)
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
  const showGenerationUi = isRunning || isConnecting

  const imagePayload =
    contentKind === 'image' ? (run?.payload as ImageGenerationPayload | undefined) : undefined
  const adPayload = contentKind === 'ad' ? (run?.payload as StaticAdGenerationPayload | undefined) : undefined
  const videoPayload =
    contentKind === 'video' ? (run?.payload as VideoGenerationPayload | undefined) : undefined

  const model = useMemo(
    () => findModel(models, imagePayload?.model ?? adPayload?.model ?? videoPayload?.model),
    [models, imagePayload?.model, adPayload?.model, videoPayload?.model],
  )
  const languageLabel =
    adPayload?.language && adPayload.language !== 'en' ? getLanguageLabel(adPayload.language) : undefined
  const adReferenceUrls = adPayload ? collectStaticAdReferenceUrls(adPayload) : []

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
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollBehavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

    if (isComplete && hasCompleteOutput) {
      outputRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' })
      return
    }

    if (isRunning && lastScrolledStepRef.current !== activeStepIndex) {
      lastScrolledStepRef.current = activeStepIndex
      activeStepRef.current?.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' })
    }
  }, [activeStepIndex, hasCompleteOutput, isComplete, isRunning])

  let promptBrief: ReactNode = null
  if (imagePayload) {
    promptBrief = <GenerationRunPromptBrief kind="image" model={model} payload={imagePayload} />
  } else if (adPayload) {
    promptBrief = <GenerationRunPromptBrief kind="ad" payload={adPayload} />
  } else if (videoPayload) {
    promptBrief = <GenerationRunPromptBrief kind="video" model={model} payload={videoPayload} />
  }

  const hasBriefOrRunning = Boolean(promptBrief) || isRunning

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

  const missingOutputMessage =
    contentKind === 'video'
      ? 'The run completed but no video was returned.'
      : 'The run completed but no image was returned.'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <GenerationProgressHeader
        backHref={backHref}
        backLabel={studioLabel}
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
          'mx-auto w-full max-w-2xl flex-1 px-5 sm:px-6',
          isComplete && hasCompleteOutput ? 'py-5 sm:py-6' : 'py-2 sm:py-4',
        )}
      >
        <div className={cn(isComplete && hasCompleteOutput ? 'space-y-5' : 'space-y-0')}>
          {isComplete && imageOutput?.imageUrl ? (
            <>
              <GeneratedImage
                aspectRatio={aspectRatio}
                contentKind={contentKind === 'ad' ? 'ad' : 'image'}
                cost={imageOutput.cost}
                durationMs={run?.durationMs}
                imageRef={outputRef}
                languageLabel={languageLabel}
                modelName={model?.name ?? (contentKind === 'ad' ? 'GPT Image 2' : undefined)}
                newGenerationHref={backHref}
                onSelectedUrlChange={setRemixImageUrl}
                output={imageOutput}
                previewVariant="bare"
                productImageUrl={
                  adReferenceUrls[0] ? resolveGeneratedImagePreviewUrl(adReferenceUrls[0]) : undefined
                }
                prompt={imagePayload?.prompt ?? adPayload?.prompt}
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
              {contentKind === 'image' ? (
                <div className="flex justify-center">
                  <Link
                    href={DASHBOARD_ROUTES.STUDIO.IMAGES}
                    className="text-[13px] font-medium tracking-[-0.015em] text-black/48 underline decoration-black/15 underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground dark:text-white/48 dark:decoration-white/15"
                  >
                    Browse more templates
                  </Link>
                </div>
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
              previewVariant="bare"
              prompt={videoPayload?.prompt}
              referenceUrls={videoPayload ? collectVideoReferenceUrls(videoPayload) : undefined}
              videoRef={outputRef}
            />
          ) : null}

          {showGenerationUi ? (
            <>
              <GenerationMatrixPlaceholder
                contentKind={contentKind}
                headingId={previewHeadingId}
                isConnecting={isConnecting}
                statusLabel={status.label}
              />

              {hasBriefOrRunning ? (
                <div className="mt-2 space-y-8 border-t border-black/8 pt-8 dark:border-white/10">
                  {promptBrief}

                  {isRunning && run ? (
                    <GenerationPipelineSection
                      activeStepIndex={activeStepIndex}
                      activeStepRef={activeStepRef}
                      headingId={progressHeadingId}
                      progress={status.progress}
                      statusLabel={status.label}
                    />
                  ) : null}

                  {contentKind !== 'ad' ? (
                    <GenerationWaitingTips kind={contentKind === 'video' ? 'video' : 'image'} />
                  ) : null}
                </div>
              ) : contentKind !== 'ad' ? (
                <div className="mt-8">
                  <GenerationWaitingTips kind={contentKind === 'video' ? 'video' : 'image'} />
                </div>
              ) : null}
            </>
          ) : null}

          {isFailed ? (
            <div className="pt-6">
              <GenerationFailureAlert
                message={failureMessage}
                retryHref={backHref}
                retryLabel={retryLabel}
              />
            </div>
          ) : null}

          {isComplete && !hasCompleteOutput ? (
            <GenerationMissingOutputAlert message={missingOutputMessage} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
