import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { downloadGeneratedImage, saveGeneratedImageToWorkspace } from '@/lib/image-generation/image-actions'
import { dataImageUrlToBlobUrl, isDataImageUrl, resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatCost, formatDuration } from '@/utils/format'
import { ASPECT_RATIO_LABELS } from '@/constants/generation.const'
import type { ImageGenerationOutput } from '@socialista/trigger'
import { AlertCircleIcon, CheckIcon, DownloadIcon, FolderInputIcon, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GenerationPreviewFrame } from './generation-preview-frame'

type GeneratedImageProps = {
  output: ImageGenerationOutput
  durationMs: number | undefined
  cost: number | undefined
  imageRef: RefObject<HTMLDivElement | null>
  prompt?: string
  aspectRatio?: string
  modelName?: string
}

export function GeneratedImage({
  output,
  durationMs,
  cost,
  imageRef,
  prompt,
  aspectRatio,
  modelName,
}: GeneratedImageProps) {
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
  const aspectLabel = aspectRatio ? (ASPECT_RATIO_LABELS[aspectRatio] ?? aspectRatio) : undefined

  return (
    <div ref={imageRef} className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">Your image</h2>
        <p className="text-sm text-muted-foreground">Ready to download or save to your workspace.</p>
      </div>

      {prompt ? (
        <div className="space-y-2 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
          <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/90">{prompt}</p>
          <div className="flex flex-wrap gap-1.5">
            {aspectLabel ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {aspectLabel} · {aspectRatio}
              </span>
            ) : null}
            {modelName ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {modelName}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <GenerationPreviewFrame
        aspectRatio={aspectRatio}
        isLoading={isPreviewLoading}
        maxHeightClass="max-h-[calc(100dvh-14rem)]"
        variant="viewport"
      >
        {previewError || (!isPreviewLoading && !previewSrc) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <AlertCircleIcon className="size-5 text-destructive" />
            <p className="text-sm text-destructive">Could not load the generated image preview.</p>
          </div>
        ) : previewSrc ? (
          isDataImageUrl(output.imageUrl) || previewSrc.startsWith('blob:') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="Generated image"
              className="absolute inset-0 size-full object-contain"
              onError={() => setPreviewError(true)}
              src={previewSrc}
            />
          ) : (
            <Image
              alt="Generated image"
              className="object-contain"
              fill
              onError={() => setPreviewError(true)}
              sizes="(max-width: 768px) 100vw, 672px"
              src={previewSrc}
              unoptimized
            />
          )
        ) : null}
      </GenerationPreviewFrame>

      <p className="text-center text-[12px] tabular-nums text-muted-foreground">
        {formatDuration(durationMs)} · {formatCost(cost)}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <Button
          className="h-9 gap-1.5 px-4 text-[13px]"
          disabled={isBusy}
          onClick={() => void handleDownload()}
          size="sm"
          type="button"
        >
          {isDownloading ? <Spinner className="size-3.5" /> : <DownloadIcon className="size-3.5" />}
          Download
        </Button>
        <Button
          className="h-9 gap-1.5 px-3.5 text-[13px]"
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
        <Button asChild className="h-9 gap-1.5 px-3.5 text-[13px] text-muted-foreground" size="sm" type="button" variant="ghost">
          <Link href="/dashboard/studio/images">
            <PlusIcon className="size-3.5" />
            New generation
          </Link>
        </Button>
      </div>
    </div>
  )
}
