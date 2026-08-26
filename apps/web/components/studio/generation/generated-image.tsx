'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ASPECT_RATIO_LABELS } from '@/constants/generation.const'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { downloadGeneratedImage } from '@/lib/image-generation/image-actions'
import { dataImageUrlToBlobUrl, isDataImageUrl, resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { cn } from '@/lib/utils'
import { formatCost, formatDuration } from '@/utils/format'
import type { ImageGenerationOutput } from '@socialista/types'
import { AlertCircleIcon, CheckIcon, DownloadIcon, PlusIcon, SendIcon, VideoIcon } from 'lucide-react'
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
  onSelectedUrlChange?: (url: string) => void
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
  onSelectedUrlChange,
}: GeneratedImageProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(true)

  const imageUrls =
    output.imageUrls && output.imageUrls.length > 0 ? output.imageUrls : [output.imageUrl]
  const activeIndex = Math.min(selectedIndex, Math.max(0, imageUrls.length - 1))
  const selectedUrl = imageUrls[activeIndex] ?? output.imageUrl
  const isMultiple = imageUrls.length > 1

  useEffect(() => {
    let blobUrl: string | null = null
    let cancelled = false

    async function resolvePreview() {
      setPreviewError(false)
      setIsPreviewLoading(true)
      setPreviewSrc(null)

      if (!selectedUrl) {
        setIsPreviewLoading(false)
        return
      }

      if (isDataImageUrl(selectedUrl)) {
        try {
          blobUrl = await dataImageUrlToBlobUrl(selectedUrl)
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

      setPreviewSrc(resolveGeneratedImagePreviewUrl(selectedUrl))
      setIsPreviewLoading(false)
    }

    void resolvePreview()

    return () => {
      cancelled = true
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [selectedUrl])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadGeneratedImage(selectedUrl, prompt)
      toast.success('Download started')
    } catch {
      toast.error('Could not download image')
    } finally {
      setIsDownloading(false)
    }
  }

  const aspectLabel = aspectRatio ? (ASPECT_RATIO_LABELS[aspectRatio] ?? aspectRatio) : undefined

  const isAd = contentKind === 'ad'
  const resultTitle = isAd ? 'Your ad' : isMultiple ? 'Your images' : 'Your image'
  const resultDescription = isAd
    ? 'Ready to download, post, or create another variation.'
    : isMultiple
      ? 'Select an image to download, remix, or turn into a video.'
      : 'Ready to download, remix, or turn into a video.'
  const newGenerationLabel = isAd ? 'Create another ad' : 'New generation'
  const previewAlt = isAd ? 'Generated ad' : isMultiple ? `Generated image ${activeIndex + 1}` : 'Generated image'
  const createVideoHref = output.generationId
    ? DASHBOARD_ROUTES.STUDIO.createVideo({ generationId: output.generationId })
    : undefined

  return (
    <div ref={imageRef} className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-[15px] font-medium tracking-[-0.015em] text-foreground">{resultTitle}</h2>
        <p className="text-[13px] leading-[1.5] text-black/56 dark:text-white/56">{resultDescription}</p>
      </div>

      {(prompt || aspectLabel || modelName || productImageUrl || languageLabel) ? (
        <div className="space-y-2 rounded-xl border border-black/10 bg-black/[0.02] px-3.5 py-3 dark:border-white/12 dark:bg-white/[0.02]">
          {prompt ? (
            <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/90">{prompt}</p>
          ) : isAd ? (
            <p className="text-[13px] leading-relaxed text-black/56 dark:text-white/56">
              No brief notes — generated from your product image.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5">
            {aspectLabel ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12">
                {aspectLabel} · {aspectRatio}
              </span>
            ) : null}
            {languageLabel ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12">
                {languageLabel}
              </span>
            ) : null}
            {modelName ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12">
                {modelName}
              </span>
            ) : null}
            {productImageUrl ? (
              <div className="ml-auto flex">
                <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-black/10 bg-black/[0.03] dark:border-white/12 dark:bg-white/[0.03]">
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

      {output.generationId ? (
        <div className="flex justify-start gap-2">
          <Button asChild className="h-9 gap-1.5 px-4 text-[13px]" size="sm" type="button">
            <Link href={DASHBOARD_ROUTES.createPost({ generationId: output.generationId })}>
              <SendIcon className="size-3.5" />
              Post now
            </Link>
          </Button>
          {createVideoHref ? (
            <Button asChild className="h-9 gap-1.5 px-4 text-[13px]" size="sm" type="button" variant="outline">
              <Link href={createVideoHref}>
                <VideoIcon className="size-3.5" />
                Create video
              </Link>
            </Button>
          ) : null}
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
          isDataImageUrl(selectedUrl) || previewSrc.startsWith('blob:') ? (
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

      {isMultiple ? (
        <div
          className="flex flex-wrap items-center gap-2"
          role="listbox"
          aria-label="Generated images"
        >
          {imageUrls.map((url, index) => {
            const isSelected = index === activeIndex
            return (
              <button
                key={url}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-label={`Image ${index + 1}`}
                onClick={() => {
                  setSelectedIndex(index)
                  onSelectedUrlChange?.(url)
                }}
                className={cn(
                  'relative size-14 overflow-hidden rounded-lg ring-1 transition-[transform,ring-color] duration-150',
                  'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                  isSelected
                    ? 'ring-2 ring-foreground/35'
                    : 'ring-black/10 hover:ring-black/18 dark:ring-white/12 dark:hover:ring-white/20',
                )}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="56px"
                  src={resolveGeneratedImagePreviewUrl(url)}
                  unoptimized
                />
              </button>
            )
          })}
        </div>
      ) : null}

      <p className="text-left text-[12px] tabular-nums text-black/44 dark:text-white/44">
        {formatDuration(durationMs)} · {formatCost(cost)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
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
        <Button asChild className="h-9 gap-1.5 px-3.5 text-[13px] text-muted-foreground" size="sm" type="button" variant="ghost">
          <Link href={newGenerationHref}>
            <PlusIcon className="size-3.5" />
            {newGenerationLabel}
          </Link>
        </Button>
      </div>

      <p className="flex items-center gap-1.5 text-[12px] text-black/44 dark:text-white/44">
        <CheckIcon className="size-3.5" />
        <span>
          Automatically saved to{' '}
          <Link className="underline decoration-black/20 underline-offset-2 hover:text-foreground dark:decoration-white/20" href={DASHBOARD_ROUTES.FILES}>
            your files
          </Link>
        </span>
      </p>
    </div>
  )
}
