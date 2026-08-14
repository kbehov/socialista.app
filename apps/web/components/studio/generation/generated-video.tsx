'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ASPECT_RATIO_LABELS } from '@/constants/generation.const'
import { downloadGeneratedVideo } from '@/lib/video-generation/video-actions'
import { resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { formatCost, formatDuration } from '@/utils/format'
import type { VideoGenerationOutput } from '@socialista/types'
import { AlertCircleIcon, CheckIcon, DownloadIcon, FolderIcon, PlusIcon, SendIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { RefObject } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { GenerationPreviewFrame } from './generation-preview-frame'

type GeneratedVideoProps = {
  output: VideoGenerationOutput
  durationMs: number | undefined
  cost: number | undefined
  videoRef: RefObject<HTMLDivElement | null>
  prompt?: string
  aspectRatio?: string
  modelName?: string
  generateAudio?: boolean
  durationSec?: number
  newGenerationHref?: string
  referenceUrls?: string[]
}

export function GeneratedVideo({
  output,
  durationMs,
  cost,
  videoRef,
  prompt,
  aspectRatio,
  modelName,
  generateAudio,
  durationSec,
  newGenerationHref = DASHBOARD_ROUTES.STUDIO.VIDEOS,
  referenceUrls,
}: GeneratedVideoProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [previewError, setPreviewError] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadGeneratedVideo(output.videoUrl, prompt)
      toast.success('Download started')
    } catch {
      toast.error('Could not download video')
    } finally {
      setIsDownloading(false)
    }
  }

  const aspectLabel = aspectRatio ? (ASPECT_RATIO_LABELS[aspectRatio] ?? aspectRatio) : undefined
  const clipSeconds = durationSec ?? output.durationSec

  return (
    <div ref={videoRef} className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">Your video</h2>
        <p className="text-sm text-muted-foreground">Video is saved to library.</p>
      </div>

      {(prompt || aspectLabel || modelName || clipSeconds || generateAudio != null) ? (
        <div className="space-y-2 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
          {prompt ? (
            <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/90">{prompt}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5">
            {aspectLabel ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {aspectLabel} · {aspectRatio}
              </span>
            ) : null}
            {clipSeconds ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {clipSeconds}s
              </span>
            ) : null}
            {generateAudio != null ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {generateAudio ? 'Audio on' : 'Muted'}
              </span>
            ) : null}
            {modelName ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {modelName}
              </span>
            ) : null}
            {referenceUrls && referenceUrls.length > 0 ? (
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
      ) : null}

      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <CheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Saved to library</span>
        <Link href={DASHBOARD_ROUTES.FILES} className="inline-flex items-center gap-1 text-foreground/80 underline-offset-2 hover:underline">
          <FolderIcon className="size-3.5" />
          Open files
        </Link>
      </div>

      {output.generationId ? (
        <div className="flex justify-start">
          <Button asChild className="h-9 gap-1.5 px-4 text-[13px]" size="sm" type="button">
            <Link href={DASHBOARD_ROUTES.createPost({ generationId: output.generationId })}>
              <SendIcon className="size-3.5" />
              Post now
            </Link>
          </Button>
        </div>
      ) : null}

      <GenerationPreviewFrame aspectRatio={aspectRatio} maxHeightClass="max-h-[calc(100dvh-14rem)]">
        {previewError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <AlertCircleIcon className="size-5 text-destructive" />
            <p className="text-sm text-destructive">Could not load the generated video.</p>
          </div>
        ) : (
          <video
            className="absolute inset-0 size-full bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            src={output.videoUrl}
            onError={() => setPreviewError(true)}
          />
        )}
      </GenerationPreviewFrame>

      <p className="text-center text-[12px] tabular-nums text-muted-foreground">
        {formatDuration(durationMs)} · {formatCost(cost)}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <Button
          className="h-9 gap-1.5 px-4 text-[13px]"
          disabled={isDownloading}
          onClick={() => void handleDownload()}
          size="sm"
          type="button"
        >
          {isDownloading ? <Spinner className="size-3.5" /> : <DownloadIcon className="size-3.5" />}
          Download
        </Button>
        {output.videoId ? (
          <Button asChild className="h-9 gap-1.5 px-3.5 text-[13px]" size="sm" type="button" variant="outline">
            <Link href={DASHBOARD_ROUTES.STUDIO.video(output.videoId)}>Open in editor</Link>
          </Button>
        ) : null}
        <Button asChild className="h-9 gap-1.5 px-3.5 text-[13px] text-muted-foreground" size="sm" type="button" variant="ghost">
          <Link href={newGenerationHref}>
            <PlusIcon className="size-3.5" />
            New generation
          </Link>
        </Button>
      </div>
    </div>
  )
}
