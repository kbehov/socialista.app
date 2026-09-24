'use client'

import { ImagePromptInput, type ImagePromptSubmitResult } from '@/components/studio/images/prompt-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { createInfluencerScene } from '@/services/influencer.service'
import { useProjectStore, getProjectId } from '@/store/project.store'
import type { Model } from '@socialista/types'
import { LoaderCircleIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

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

type InfluencerSceneDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  influencerId: string
  influencerName: string
  sourceImageUrl: string
  models: Model[]
  onGenerated: () => void
}

function runErrorMessage(run: { metadata?: Record<string, unknown> } | undefined) {
  const error = run?.metadata?.error
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Scene generation failed'
}

function runStatusLabel(run: { metadata?: Record<string, unknown> } | undefined) {
  const status = run?.metadata?.status
  if (typeof status === 'object' && status && 'label' in status && typeof status.label === 'string') {
    return status.label
  }
  return 'Generating scene…'
}

export function InfluencerSceneDialog({
  open,
  onOpenChange,
  influencerId,
  influencerName,
  sourceImageUrl,
  models,
  onGenerated,
}: InfluencerSceneDialogProps) {
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [pending, setPending] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const completedRunRef = useRef<string | null>(null)

  const { run } = useGenerationRun({
    runId: runId ?? '',
    accessToken,
  })

  const runFailed = Boolean(run?.status && FAILED_STATUSES.has(run.status))

  useEffect(() => {
    if (!runId || run?.status !== 'COMPLETED') return
    if (completedRunRef.current === runId) return
    completedRunRef.current = runId
    toast.success('New photo ready')
    onGenerated()
    onOpenChange(false)
  }, [onGenerated, onOpenChange, run?.status, runId])

  const handleRetry = () => {
    setPending(false)
    setRunId(null)
    setAccessToken(null)
  }

  const handleSubmit = async (result: ImagePromptSubmitResult) => {
    setPending(true)
    const response = await createInfluencerScene(influencerId, {
      sourceImageUrl,
      prompt: result.prompt,
      model: result.model,
      aspectRatio: result.aspectRatio,
      count: result.numImages,
      ...(projectId ? { projectId } : {}),
    })

    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Failed to start scene')
      setPending(false)
      return
    }

    storeGenerationAccessToken(response.data.runId, response.data.publicAccessToken)
    setRunId(response.data.runId)
    setAccessToken(response.data.publicAccessToken)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New photo</DialogTitle>
          <DialogDescription>
            Generate another scene of {influencerName}. Identity stays locked to this reference.
          </DialogDescription>
        </DialogHeader>

        {runId ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-muted/20 px-6 py-12 ring-1 ring-border/40">
            {runFailed ? (
              <>
                <p className="text-[15px] font-medium tracking-[-0.02em] text-destructive">
                  {runErrorMessage(run)}
                </p>
                <Button type="button" variant="outline" className="rounded-xl" onClick={handleRetry}>
                  Try again
                </Button>
              </>
            ) : (
              <>
                <LoaderCircleIcon className="size-7 animate-spin text-muted-foreground" strokeWidth={1.5} />
                <p className="text-[15px] font-medium tracking-[-0.02em]">{runStatusLabel(run)}</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative mx-auto aspect-3/4 w-full max-w-[11rem] overflow-hidden rounded-2xl bg-muted/30 outline outline-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)]">
              <Image
                src={sourceImageUrl}
                alt={`${influencerName} identity reference`}
                fill
                unoptimized
                className="object-cover"
                sizes="176px"
              />
            </div>

            <ImagePromptInput
              key={sourceImageUrl}
              models={models}
              bindStudio={false}
              hideExtras
              embedded
              autoFocus
              pending={pending}
              attachmentsLocked
              initialAttachmentUrl={sourceImageUrl}
              initialAspectRatio="9:16"
              placeholder="coffee shop window, golden hour, looking at camera…"
              onSubmitOverride={result => {
                void handleSubmit(result)
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
