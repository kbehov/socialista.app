import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ASPECT_RATIO_LABELS } from '@/constants/generation.const'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { downloadGeneratedImage, saveGeneratedImageToWorkspace } from '@/lib/image-generation/image-actions'
import { dataImageUrlToBlobUrl, isDataImageUrl, resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatCost, formatDuration } from '@/utils/format'
import type { ImageGenerationOutput } from '@socialista/types'
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
  newGenerationHref?: string
  contentKind?: 'image' | 'ad'
  productImageUrl?: string
  languageLabel?: string
}

export function GeneratedImage({
  output,
  durationMs,
  cost,
  imageRef,
  prompt,
  aspectRatio,
  modelName,
  newGenerationHref = DASHBOARD_ROUTES.STUDIO.IMAGES,
  contentKind = 'image',
  productImageUrl,
  languageLabel,
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

  const isAd = contentKind === 'ad'
  const resultTitle = isAd ? 'Your ad' : 'Your image'
  const resultDescription = isAd
    ? 'Ready to download, save to files, or create another variation.'
    : 'Ready to download or save to your workspace.'
  const newGenerationLabel = isAd ? 'Create another ad' : 'New generation'
  const previewAlt = isAd ? 'Generated ad' : 'Generated image'

  return (
    <div ref={imageRef} className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{resultTitle}</h2>
        <p className="text-sm text-muted-foreground">{resultDescription}</p>
      </div>

      {(prompt || aspectLabel || modelName || productImageUrl || languageLabel) ? (
        <div className="space-y-2 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3">
          {prompt ? (
            <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/90">{prompt}</p>
          ) : isAd ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              No creative direction — generated from your product image.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5">
            {aspectLabel ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {aspectLabel} · {aspectRatio}
              </span>
            ) : null}
            {languageLabel ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {languageLabel}
              </span>
            ) : null}
            {modelName ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                {modelName}
              </span>
            ) : null}
            {productImageUrl ? (
              <div className="ml-auto flex">
                <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/30">
                  <Image
                    alt="Product reference"
                    className="object-cover"
                    fill
                    sizes="32px"
                    src={productImageUrl}
                    unoptimized
                  />
                </div>
              </div>
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
              alt={previewAlt}
              className="absolute inset-0 size-full object-contain"
              onError={() => setPreviewError(true)}
              src={previewSrc}
            />
          ) : (
            <Image
              alt={previewAlt}
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
          <Link href={newGenerationHref}>
            <PlusIcon className="size-3.5" />
            {newGenerationLabel}
          </Link>
        </Button>
      </div>
    </div>
  )
}
