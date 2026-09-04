'use client'

import {
  PromptInputButton,
  PromptInputProvider,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { STUDIO_COMPOSER_SURFACE_CLASS, STUDIO_TOOL_BUTTON_CLASS, STUDIO_TOOL_CHEVRON_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import { StudioReferenceTagHint } from '@/components/studio/prompt/studio-reference-tag-hint'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { AspectRatio, Model, UgcClip, UgcProject } from '@socialista/types'
import { ASPECT_RATIOS, ugcResolvedClipModels } from '@socialista/types'
import { ChevronDownIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

const ASPECT_OPTIONS = [
  { id: '9:16' as const, label: 'Portrait', ratio: 9 / 16 },
  { id: '16:9' as const, label: 'Landscape', ratio: 16 / 9 },
  { id: '1:1' as const, label: 'Square', ratio: 1 },
  { id: '4:3' as const, label: 'Classic', ratio: 4 / 3 },
]
const DEFAULT_ASPECT = { id: '9:16' as const, label: 'Portrait', ratio: 9 / 16 }

type UgcPhotosComposerProps = {
  workspaceId: string
  project: UgcProject
  clip: UgcClip
  generating?: boolean
  progress?: number
  progressLabel?: string
  onGenerate: (input: {
    prompt: string
    imageUrls: string[]
    modelValue: string
    aspectRatio: AspectRatio
  }) => void
  onRegenerateStill: (index: number) => void
}

export function UgcPhotosComposer({
  workspaceId,
  project,
  clip,
  generating,
  progress,
  progressLabel,
  onGenerate,
  onRegenerateStill,
}: UgcPhotosComposerProps) {
  const imageModels = useUgcProjectStore(s => s.imageModels)
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const resolved = ugcResolvedClipModels(project, clip)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    (ASPECT_RATIOS as readonly string[]).includes(project.aspectRatio)
      ? (project.aspectRatio as AspectRatio)
      : '9:16',
  )
  const [selectedModelId, setSelectedModelId] = useState(
    () => imageModels.find(model => model.value === resolved.image)?._id ?? imageModels[0]?._id ?? '',
  )

  const influencer = clip.influencerId
    ? influencersById[clip.influencerId]
    : project.influencerId
      ? influencersById[project.influencerId]
      : undefined

  const campaignAttachments = useMemo(() => {
    const next: AttachedMedia[] = []
    if (project.productImageUrls[0]) {
      next.push({
        id: `product-${project.productId ?? 'campaign'}`,
        url: project.productImageUrls[0],
        kind: 'image',
        source: 'product',
        label: project.productName ?? 'Product',
        productId: project.productId,
      })
    }
    const cover = influencer?.coverImageUrl || influencer?.galleryImageUrls[0]
    if (cover && influencer) {
      next.push({
        id: `influencer-${influencer._id}`,
        url: cover,
        kind: 'image',
        source: 'influencer',
        label: influencer.name,
        influencerId: influencer._id,
      })
    }
    return next
  }, [
    influencer,
    project.productId,
    project.productImageUrls,
    project.productName,
  ])

  const [extraAttachments, setExtraAttachments] = useState<AttachedMedia[]>(() =>
    (clip.referenceImageUrls ?? [])
      .filter(url => !campaignAttachments.some(item => item.url === url))
      .map(url => ({
        id: url,
        url,
        kind: 'image' as const,
        source: 'upload' as const,
        label: 'Reference',
      })),
  )
  const attachments = [...campaignAttachments, ...extraAttachments].slice(0, 5)
  const selectedAspect =
    ASPECT_OPTIONS.find(option => option.id === aspectRatio) ?? DEFAULT_ASPECT
  const selectedModel: Model | undefined =
    imageModels.find(model => model._id === selectedModelId) ?? imageModels[0]

  const handleSubmit = (message: PromptInputMessage) => {
    if (!selectedModel) return
    onGenerate({
      prompt: message.text.trim(),
      imageUrls: attachments.map(item => item.url),
      modelValue: selectedModel.value,
      aspectRatio,
    })
  }

  const stills = clip.stills.length > 0 ? clip.stills : [{ index: 0 }]

  return (
    <div className="space-y-3">
      {project.productImageUrls.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Add a product above for talking and hold clips. You can still generate without one.
        </p>
      ) : null}
      <PromptInputProvider key={clip.id} initialInput={clip.scenePrompt ?? ''}>
        <StudioPromptComposer
          models={imageModels}
          selectedModelId={selectedModel?._id ?? ''}
          onSelectedModelChange={setSelectedModelId}
          attachments={attachments}
          onAttachmentsChange={files => {
            const campaignIds = new Set(campaignAttachments.map(item => item.id))
            setExtraAttachments(files.filter(file => !campaignIds.has(file.id)))
          }}
          attachSources={['upload', 'library', 'influencer', 'product']}
          maxAttachments={5}
          workspaceId={workspaceId}
          placeholder="Describe the scene, lighting, and framing…"
          pending={generating}
          disabled={generating}
          onSubmit={handleSubmit}
          submitLabel="Generate photo"
          surfaceClassName={STUDIO_COMPOSER_SURFACE_CLASS}
          tools={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <PromptInputButton
                  aria-label={`Aspect ratio ${selectedAspect.id}`}
                  className={STUDIO_TOOL_BUTTON_CLASS}
                  disabled={generating}
                  size="xs"
                  type="button"
                >
                  <AspectRatioIcon active ratio={selectedAspect.ratio} />
                  <span className="text-[12px] font-medium">{selectedAspect.id}</span>
                  <ChevronDownIcon className={STUDIO_TOOL_CHEVRON_CLASS} />
                </PromptInputButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={aspectRatio}
                  onValueChange={next => setAspectRatio(next as AspectRatio)}
                >
                  {ASPECT_OPTIONS.map(option => (
                    <DropdownMenuRadioItem key={option.id} value={option.id}>
                      {option.label} · {option.id}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      </PromptInputProvider>
      <StudioReferenceTagHint attachmentCount={attachments.length} />

      {generating ? (
        <p className="text-[12px] text-muted-foreground" aria-live="polite">
          {progressLabel ?? 'Generating photos…'} {progress ? `· ${Math.round(progress)}%` : ''}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:max-w-[220px]">
        {stills.slice(0, 1).map((still, index) => (
          <div key={`${clip.id}-still-${index}`} className="space-y-1">
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border/50">
              {still.imageUrl ? (
                <Image
                  alt={`Photo ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="180px"
                  src={still.imageUrl}
                  unoptimized
                />
              ) : generating ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                </span>
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">
                  Photo
                </span>
              )}
            </div>
            {still.imageUrl ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-full text-[11px]"
                disabled={generating}
                onClick={() => onRegenerateStill(index)}
              >
                <RefreshCwIcon className="size-3" />
                Redo
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
