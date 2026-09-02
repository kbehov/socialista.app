'use client'

import {
  PromptInputProvider,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { STUDIO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import { LanguageSelector, DEFAULT_AD_LANGUAGE } from '@/components/ui/language-selector'
import { STATIC_AD_FORMAT_PRESETS } from '@/lib/studio/static-ads/format-presets'
import { cn } from '@/lib/utils'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { AspectRatio, UgcClip, UgcProject } from '@socialista/types'
import { STATIC_AD_MODEL } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

type UgcImageAdComposerProps = {
  workspaceId: string
  project: UgcProject
  clip: UgcClip
  generating?: boolean
  progress?: number
  progressLabel?: string
  onGenerate: (input: {
    prompt?: string
    language: string
    aspectRatio: AspectRatio
    productImage: string
  }) => void
}

export function UgcImageAdComposer({
  workspaceId,
  project,
  clip,
  generating,
  progress,
  progressLabel,
  onGenerate,
}: UgcImageAdComposerProps) {
  const imageModels = useUgcProjectStore(s => s.imageModels)
  const [language, setLanguage] = useState(DEFAULT_AD_LANGUAGE)
  const [presetId, setPresetId] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16')
  const models = imageModels.length > 0 ? imageModels : []
  const selectedModel =
    models.find(model => model.value === STATIC_AD_MODEL) ?? models[0]

  const attachments = useMemo<AttachedMedia[]>(() => {
    const url = project.productImageUrls[0]
    if (!url) return []
    return [
      {
        id: `product-${project.id}`,
        url,
        kind: 'image',
        source: 'product',
        label: project.productName ?? 'Product',
        productId: project.productId,
      },
    ]
  }, [project.id, project.productId, project.productImageUrls, project.productName])
  const [extra, setExtra] = useState<AttachedMedia[]>([])
  const allAttachments = [...attachments, ...extra].slice(0, 3)

  const handleSubmit = (message: PromptInputMessage) => {
    const productImage = allAttachments[0]?.url
    if (!productImage) return
    const preset = STATIC_AD_FORMAT_PRESETS.find(item => item.id === presetId)
    const prompt = [preset?.prompt, message.text.trim()].filter(Boolean).join('\n\n')
    onGenerate({
      prompt: prompt || undefined,
      language,
      aspectRatio,
      productImage,
    })
  }

  return (
    <div className="space-y-3">
      {project.productImageUrls.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">Add a product photo above to generate an image ad.</p>
      ) : null}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATIC_AD_FORMAT_PRESETS.slice(0, 12).map(preset => {
          const active = preset.id === presetId
          return (
            <button
              key={preset.id}
              type="button"
              disabled={generating}
              onClick={() => {
                setPresetId(preset.id)
                setAspectRatio(preset.aspectRatio)
              }}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
                active
                  ? 'border-foreground/30 bg-foreground text-background'
                  : 'border-border/60 bg-background hover:border-border',
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {clip.imageAdUrl ? (
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl ring-1 ring-border/50">
          <Image alt="Image ad" src={clip.imageAdUrl} fill className="object-cover" unoptimized />
        </div>
      ) : generating ? (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground" aria-live="polite">
          <Loader2Icon className="size-3.5 animate-spin" />
          {progressLabel ?? 'Generating image ad…'}
          {progress ? ` · ${Math.round(progress)}%` : ''}
        </div>
      ) : null}

      <PromptInputProvider key={`${clip.id}-image-ad`}>
        <StudioPromptComposer
          models={models}
          selectedModelId={selectedModel?._id ?? ''}
          onSelectedModelChange={() => undefined}
          hideModelSelector
          attachments={allAttachments}
          onAttachmentsChange={files => setExtra(files.filter(file => file.source !== 'product'))}
          attachSources={['upload', 'library', 'product', 'influencer']}
          minAttachments={1}
          maxAttachments={3}
          requirePrompt={false}
          workspaceId={workspaceId}
          placeholder="Optional notes — or pick a format above."
          pending={generating}
          disabled={generating}
          onSubmit={handleSubmit}
          submitLabel="Generate image ad"
          surfaceClassName={STUDIO_COMPOSER_SURFACE_CLASS}
          tools={
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={generating}
              variant="ghost"
            />
          }
        />
      </PromptInputProvider>
    </div>
  )
}
