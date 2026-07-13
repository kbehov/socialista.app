'use client'

import { Shimmer } from '@/components/ai-elements/shimmer'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  downloadGeneratedImage,
  saveGeneratedImageToWorkspace,
} from '@/lib/image-generation/image-actions'
import {
  dataImageUrlToBlobUrl,
  isDataImageUrl,
  resolveGeneratedImagePreviewUrl,
} from '@/lib/image-generation/preview'
import { extractErrorMessage, formatGenerationError } from '@/lib/image-generation/format-error'
import { readGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { Model } from '@socialista/types'
import type {
  ImageGenerationOutput,
  ImageGenerationStatus,
  ImageGenerationPayload,
  RealtimeImageGenerationTask,
} from '@socialista/trigger'
import { useRealtimeRun } from '@trigger.dev/react-hooks'
import { AlertCircleIcon, ArrowLeftIcon, CheckIcon, DownloadIcon, FolderInputIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { toast } from 'sonner'

type GenerationProgressProps = {
  runId: string
  models: Model[]
}

const ASPECT_RATIO_LABELS: Record<string, string> = {
  '1:1': 'Square',
  '16:9': 'Landscape',
  '9:16': 'Portrait',
  '4:3': 'Classic',
}

const COMPLETED_STATUSES = new Set(['COMPLETED'])
const FAILED_STATUSES = new Set([
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'CANCELLED',
  'TIMED_OUT',
  'EXPIRED',
  'INTERRUPTED',
])

const PIPELINE_STEPS = [
  { id: 'prepare', label: 'Reviewing your brief', threshold: 0 },
  { id: 'enhance', label: 'Sharpening the creative direction', threshold: 10 },
  { id: 'generate', label: 'Producing your visual', threshold: 40 },
  { id: 'queue', label: 'Queued for creation', threshold: 50 },
  { id: 'render', label: 'Rendering your asset', threshold: 65 },
  { id: 'finalize', label: 'Final polish', threshold: 90 },
] as const

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

function resolveFailureMessage(
  run: { error?: unknown; metadata?: Record<string, unknown> } | undefined,
): string {
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

function formatDuration(ms: number | undefined): string {
  if (!ms || ms <= 0) return '—'
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

function formatCost(cost: number | undefined): string {
  if (typeof cost !== 'number' || Number.isNaN(cost)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cost)
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

function StatusDot({ state }: { state: 'complete' | 'active' | 'pending' | 'failed' }) {
  return (
    <span
      className={cn(
        'relative inline-flex size-2 shrink-0 rounded-full',
        state === 'complete' && 'bg-foreground',
        state === 'active' && 'bg-foreground',
        state === 'pending' && 'bg-border',
        state === 'failed' && 'bg-destructive',
      )}
    >
      {state === 'active' ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-foreground opacity-40" />
      ) : null}
    </span>
  )
}

function PipelineStep({
  label,
  state,
  detail,
  isLast,
  stepRef,
}: {
  label: string
  state: 'complete' | 'active' | 'pending'
  detail?: string
  isLast: boolean
  stepRef?: RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={stepRef} className="relative flex gap-4">
      <div className="flex w-5 shrink-0 flex-col items-center">
        <div
          className={cn(
            'flex size-5 items-center justify-center rounded-full border',
            state === 'complete' && 'border-foreground bg-foreground text-background',
            state === 'active' && 'border-foreground bg-background',
            state === 'pending' && 'border-border bg-background',
          )}
        >
          {state === 'complete' ? (
            <CheckIcon className="size-2.5" strokeWidth={3} />
          ) : state === 'active' ? (
            <span className="size-1.5 rounded-full bg-foreground" />
          ) : (
            <span className="size-1.5 rounded-full bg-border" />
          )}
        </div>
        {!isLast ? (
          <div
            className={cn(
              'mt-1 w-px flex-1 min-h-6',
              state === 'complete' ? 'bg-foreground' : 'bg-border',
            )}
          />
        ) : null}
      </div>

      <div className={cn('min-w-0 flex-1', !isLast && 'pb-6')}>
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={cn(
              'text-sm leading-none tracking-tight',
              state === 'active' && 'font-medium text-foreground',
              state === 'complete' && 'text-muted-foreground',
              state === 'pending' && 'text-muted-foreground/50',
            )}
          >
            {state === 'active' && detail ? (
              <Shimmer as="span" className="text-foreground">
                {detail}
              </Shimmer>
            ) : (
              label
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function PromptContext({ payload, model }: { payload: ImageGenerationPayload; model?: Model }) {
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio

  return (
    <div className="border-b border-border px-6 py-5">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        Your brief
      </p>
      <p className="text-sm leading-relaxed tracking-tight text-foreground">{payload.prompt}</p>
      {payload.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Reference"
          className="mt-4 w-full max-w-xs rounded-sm border border-border"
          src={resolveGeneratedImagePreviewUrl(payload.imageUrl)}
        />
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>
          {aspectLabel} · {payload.aspectRatio}
        </span>
        {model ? (
          <>
            <span className="text-border">|</span>
            <span>{model.name}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

function GeneratedImage({
  output,
  durationMs,
  cost,
  imageRef,
  prompt,
}: {
  output: ImageGenerationOutput
  durationMs: number | undefined
  cost: number | undefined
  imageRef: RefObject<HTMLDivElement | null>
  prompt?: string
}) {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(true)

  useEffect(() => {
    let blobUrl: string | null = null
    let cancelled = false

    async function resolvePreview() {
      setPreviewError(false)
      setIsPreviewLoading(true)
      setPreviewSrc(null)

      const imageUrl = output.imageUrl
      if (!imageUrl) {
        setIsPreviewLoading(false)
        return
      }

      if (isDataImageUrl(imageUrl)) {
        try {
          blobUrl = await dataImageUrlToBlobUrl(imageUrl)
          if (cancelled) {
            URL.revokeObjectURL(blobUrl)
            return
          }
          setPreviewSrc(blobUrl)
        } catch {
          if (!cancelled) {
            setPreviewError(true)
          }
        } finally {
          if (!cancelled) {
            setIsPreviewLoading(false)
          }
        }
        return
      }

      setPreviewSrc(resolveGeneratedImagePreviewUrl(imageUrl))
      setIsPreviewLoading(false)
    }

    void resolvePreview()

    return () => {
      cancelled = true
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [output.imageUrl])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadGeneratedImage(output.imageUrl, prompt)
      toast.success('Download started')
    } catch {
      toast.error('Could not download image')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSave = async () => {
    if (!currentWorkspace?._id) {
      toast.error('No workspace selected')
      return
    }

    setIsSaving(true)
    try {
      await saveGeneratedImageToWorkspace(currentWorkspace._id, output.imageUrl, prompt)
      setSaved(true)
      toast.success('Saved to your files')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save to files')
    } finally {
      setIsSaving(false)
    }
  }

  const isBusy = isDownloading || isSaving

  return (
    <div ref={imageRef} className="px-6 pb-8">
      {isPreviewLoading ? (
        <div className="flex aspect-square w-full items-center justify-center rounded-sm border border-border bg-muted/30">
          <Spinner className="size-5 text-muted-foreground" />
        </div>
      ) : previewError || !previewSrc ? (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-sm border border-destructive/30 bg-destructive/5 px-4 text-center">
          <AlertCircleIcon className="size-5 text-destructive" />
          <p className="text-sm text-destructive">Could not load the generated image preview.</p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Generated image"
          className="w-full rounded-sm border border-border"
          onError={() => setPreviewError(true)}
          src={previewSrc}
        />
      )}
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {formatDuration(durationMs)} · {formatCost(cost)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          className="h-8 gap-1.5 text-xs"
          disabled={isBusy}
          onClick={() => void handleDownload()}
          size="sm"
          type="button"
          variant="outline"
        >
          {isDownloading ? <Spinner className="size-3.5" /> : <DownloadIcon className="size-3.5" />}
          Download
        </Button>
        <Button
          className="h-8 gap-1.5 text-xs"
          disabled={isBusy || saved}
          onClick={() => void handleSave()}
          size="sm"
          type="button"
          variant="outline"
        >
          {isSaving ? (
            <Spinner className="size-3.5" />
          ) : saved ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <FolderInputIcon className="size-3.5" />
          )}
          {saved ? 'Saved' : 'Save to files'}
        </Button>
      </div>
    </div>
  )
}

function SystemNotice({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <AlertCircleIcon className="size-6 text-muted-foreground" />
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium tracking-tight text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function GenerationProgress({ runId, models }: GenerationProgressProps) {
  const [accessToken] = useState(() => readGenerationAccessToken(runId))
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeStepRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const { run, error } = useRealtimeRun<RealtimeImageGenerationTask>(runId, {
    accessToken: accessToken ?? undefined,
    enabled: Boolean(accessToken),
  })

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

  useEffect(() => {
    const scrollTo = (node: HTMLElement | null, block: ScrollLogicalPosition) => {
      if (!node) return
      node.scrollIntoView({ behavior: 'smooth', block })
    }

    if (isComplete && output?.imageUrl) {
      scrollTo(imageRef.current, 'end')
      return
    }

    if (isFailed) {
      scrollTo(activeStepRef.current, 'center')
      return
    }

    scrollTo(activeStepRef.current, 'center')
  }, [status.progress, status.label, isComplete, isFailed, output?.imageUrl, activeStepIndex])

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

  const headerState = isComplete ? 'complete' : isFailed ? 'failed' : isRunning ? 'active' : 'pending'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <Button asChild className="h-8 gap-1.5 px-2 text-muted-foreground" size="sm" variant="ghost">
          <Link href="/dashboard/studio/images">
            <ArrowLeftIcon className="size-3.5" />
            <span className="text-xs">New generation</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <StatusDot state={headerState} />
          <span
            className={cn(
              'text-xs font-medium tracking-tight tabular-nums',
              isComplete && 'text-foreground',
              isFailed && 'text-destructive',
              isRunning && 'text-foreground',
              !isComplete && !isFailed && !isRunning && 'text-muted-foreground',
            )}
          >
            {isComplete
              ? 'Ready'
              : isFailed
                ? 'Failed'
                : isRunning
                  ? `${Math.round(status.progress)}%`
                  : 'Connecting'}
          </span>
        </div>
      </header>

      <div className="relative h-px w-full shrink-0 bg-border">
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-[width] duration-500 ease-out',
            isFailed ? 'bg-destructive' : 'bg-foreground',
          )}
          style={{ width: `${isComplete || isFailed ? 100 : Math.min(status.progress, 100)}%` }}
        />
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-2xl">
          {payload ? <PromptContext model={model} payload={payload} /> : null}

          <div className="px-6 py-8">
            {(isRunning || isComplete || isFailed) && run ? (
              <div className="space-y-0">
                {PIPELINE_STEPS.map((step, index) => {
                  const nextThreshold = PIPELINE_STEPS[index + 1]?.threshold
                  const state = isComplete
                    ? 'complete'
                    : isFailed
                      ? index <= activeStepIndex
                        ? 'complete'
                        : 'pending'
                      : stepState(status.progress, step.threshold, nextThreshold, false)
                  const isActive = isRunning && !isComplete && index === activeStepIndex

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
            ) : !isFailed ? (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                Connecting to your creative run…
              </div>
            ) : null}

            {isFailed ? (
              <div className="mt-6 flex items-start gap-3 border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="space-y-1">
                  <p className="text-sm font-medium tracking-tight text-destructive">
                    Generation failed
                  </p>
                  <p className="text-sm text-destructive/80">{failureMessage}</p>
                  <Button asChild className="mt-2 h-8 text-xs" size="sm" variant="outline">
                    <Link href="/dashboard/studio/images">Try another prompt</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {isComplete && !output?.imageUrl ? (
              <div className="flex items-start gap-3 border border-destructive/30 px-4 py-3">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">
                  The run completed but no image was returned.
                </p>
              </div>
            ) : null}
          </div>

          {isComplete && output?.imageUrl ? (
            <GeneratedImage
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
