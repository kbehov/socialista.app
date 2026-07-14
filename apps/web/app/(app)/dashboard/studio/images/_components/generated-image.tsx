import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { downloadGeneratedImage, saveGeneratedImageToWorkspace } from '@/lib/image-generation/image-actions'
import { dataImageUrlToBlobUrl, isDataImageUrl, resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatCost, formatDuration } from '@/utils/format'
import type { ImageGenerationOutput } from '@socialista/trigger'
import { AlertCircleIcon, CheckIcon, DownloadIcon, FolderInputIcon, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type GeneratedImageProps = {
  output: ImageGenerationOutput
  durationMs: number | undefined
  cost: number | undefined
  imageRef: RefObject<HTMLDivElement | null>
  prompt?: string
  aspectRatio?: string
}
const ASPECT_RATIO_LABELS: Record<string, string> = {
  '1:1': 'Square',
  '16:9': 'Landscape',
  '9:16': 'Portrait',
  '4:3': 'Classic',
}
const PREVIEW_FRAME_CLASS =
  'relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm h-[min(58dvh,640px)] max-h-[calc(100dvh-14rem)] sm:h-[min(62dvh,680px)]'

export function GeneratedImage({ output, durationMs, cost, imageRef, prompt, aspectRatio }: GeneratedImageProps) {
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
    <div ref={imageRef} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">Your image</h2>
          <p className="text-sm text-muted-foreground">Ready to download or save to your workspace.</p>
        </div>
        {aspectRatio ? (
          <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
            {ASPECT_RATIO_LABELS[aspectRatio] ?? aspectRatio} · {aspectRatio}
          </span>
        ) : null}
      </div>

      <div className={PREVIEW_FRAME_CLASS}>
        {isPreviewLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : previewError || !previewSrc ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <AlertCircleIcon className="size-5 text-destructive" />
            <p className="text-sm text-destructive">Could not load the generated image preview.</p>
          </div>
        ) : isDataImageUrl(output.imageUrl) || previewSrc.startsWith('blob:') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Generated image"
            className="max-h-full max-w-full object-contain"
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
        )}
      </div>

      <p className="text-[12px] tabular-nums text-muted-foreground">
        {formatDuration(durationMs)} · {formatCost(cost)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="h-9 gap-1.5 px-3.5 text-[13px]"
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
        <Button asChild className="h-9 gap-1.5 px-3.5 text-[13px]" size="sm" type="button" variant="ghost">
          <Link href="/dashboard/studio/images">
            <PlusIcon className="size-3.5" />
            New generation
          </Link>
        </Button>
      </div>
    </div>
  )
}
