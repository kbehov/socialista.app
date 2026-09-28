'use client'

import { getLanguageLabel } from '@/components/ui/language-selector'
import { ASPECT_RATIO_LABELS } from '@/constants/generation.const'
import { resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import type { ImageGenerationPayload } from '@socialista/trigger/schemas/image-generation'
import type { StaticAdGenerationPayload } from '@socialista/trigger/schemas/static-ad'
import type { VideoGenerationPayload } from '@socialista/trigger/schemas/video-generation'
import type { Model } from '@socialista/types'

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

function collectVideoReferenceUrls(payload: VideoGenerationPayload): string[] {
  const urls = [...(payload.imageUrls ?? [])]
  if (payload.imageUrl && !urls.includes(payload.imageUrl)) urls.push(payload.imageUrl)
  return urls
}

function ReferenceThumbs({ urls, max = 3 }: { urls: string[]; max?: number }) {
  if (urls.length === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      {urls.slice(0, max).map(url => (
        <div
          key={url}
          className="relative size-7 shrink-0 overflow-hidden rounded-[6px] outline outline-1 outline-black/10 dark:outline-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- provider CDNs vary; skip Next image optimizer hop */}
          <img
            alt="Reference"
            className="absolute inset-0 size-full object-cover"
            src={resolveGeneratedImagePreviewUrl(url)}
          />
        </div>
      ))}
      {urls.length > max ? (
        <span className="text-[11px] text-black/40 dark:text-white/40">+{urls.length - max}</span>
      ) : null}
    </div>
  )
}

type GenerationRunPromptBriefProps =
  | { kind: 'image'; payload: ImageGenerationPayload; model?: Model }
  | { kind: 'ad'; payload: StaticAdGenerationPayload }
  | { kind: 'video'; payload: VideoGenerationPayload; model?: Model }

export function GenerationRunPromptBrief(props: GenerationRunPromptBriefProps) {
  if (props.kind === 'image') {
    const { payload, model } = props
    const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
    const referenceUrls =
      payload.imageUrls && payload.imageUrls.length > 0
        ? payload.imageUrls
        : payload.imageUrl
          ? [payload.imageUrl]
          : []
    const numImages = payload.numImages ?? 1
    const metaParts = [
      `${aspectLabel} · ${payload.aspectRatio}`,
      model?.name,
      numImages > 1 ? `${numImages} images` : null,
    ].filter(Boolean)

    return (
      <div className="space-y-3">
        <p className="text-[14px] leading-[1.55] tracking-[-0.012em] text-foreground/88">{payload.prompt}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[12px] leading-none tracking-[-0.006em] text-black/45 dark:text-white/45">
            {metaParts.join(' · ')}
          </p>
          <ReferenceThumbs urls={referenceUrls} />
        </div>
      </div>
    )
  }

  if (props.kind === 'ad') {
    const { payload } = props
    const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
    const languageLabel =
      payload.language && payload.language !== 'en' ? getLanguageLabel(payload.language) : undefined
    const numImages = payload.numImages ?? 1
    const referenceUrls = collectStaticAdReferenceUrls(payload)
    const metaParts = [
      `${aspectLabel} · ${payload.aspectRatio}`,
      numImages > 1 ? `${numImages} images` : null,
      languageLabel,
    ].filter(Boolean)

    return (
      <div className="space-y-3">
        <p className="text-[14px] leading-[1.55] tracking-[-0.012em] text-foreground/88">
          {payload.prompt?.trim() || 'No brief notes — inventing from references'}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[12px] leading-none tracking-[-0.006em] text-black/45 dark:text-white/45">
            {metaParts.join(' · ')}
          </p>
          <ReferenceThumbs max={4} urls={referenceUrls} />
        </div>
      </div>
    )
  }

  const { payload, model } = props
  const aspectLabel = ASPECT_RATIO_LABELS[payload.aspectRatio] ?? payload.aspectRatio
  const referenceUrls = collectVideoReferenceUrls(payload)
  const metaParts = [
    `${aspectLabel} · ${payload.aspectRatio}`,
    `${payload.duration}s`,
    payload.generateAudio ? 'Audio on' : 'Muted',
    model?.name,
  ].filter(Boolean)

  return (
    <div className="space-y-3">
      <p className="text-[14px] leading-[1.55] tracking-[-0.012em] text-foreground/88">{payload.prompt}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[12px] leading-none tracking-[-0.006em] text-black/45 dark:text-white/45">
          {metaParts.join(' · ')}
        </p>
        <ReferenceThumbs urls={referenceUrls} />
      </div>
    </div>
  )
}

export { collectStaticAdReferenceUrls, collectVideoReferenceUrls }
