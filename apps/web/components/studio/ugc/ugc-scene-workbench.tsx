'use client'

import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { ImagePromptInput, type ImagePromptSubmitResult } from '@/components/studio/images/prompt-input'
import { UgcAddSceneMenu } from '@/components/studio/ugc/ugc-add-scene-menu'
import { UgcAudioPromptInput } from '@/components/studio/ugc/ugc-audio-prompt-input'
import { UgcAudioTakes } from '@/components/studio/ugc/ugc-audio-player'
import { UgcGenerationStatus } from '@/components/studio/ugc/ugc-generation-status'
import { UgcPhonePreview } from '@/components/studio/ugc/ugc-phone-preview'
import {
  UgcAudioEmptyHint,
  UgcStillsEmptyHint,
  UgcStillsGrid,
  UgcVideoEmptyHint,
} from '@/components/studio/ugc/ugc-stills-grid'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ugcClipGeneratedStills } from '@/lib/studio/ugc/ugc-stage'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import {
  UGC_CLIP_TYPE_LABELS,
  UGC_CLIP_TYPES,
  ugcClipShowsScript,
  ugcClipRequiresProduct,
  ugcClipAudioTakes,
  ugcResolvedClipModels,
  ugcResolvedInfluencerId,
  type UgcClip,
  type UgcClipType,
  type UgcClipVoice,
  type UgcProject,
} from '@socialista/types'
import { AudioLinesIcon, ChevronDownIcon, ImageIcon, VideoIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { VideoPromptInput, type VideoPromptSubmitResult } from '@/components/studio/videos/video-prompt-input'

export type UgcWorkbenchTab = 'image' | 'audio' | 'video'

type UgcSceneWorkbenchProps = {
  project: UgcProject
  clip?: UgcClip
  tab: UgcWorkbenchTab
  videoAttachments: AttachedMedia[]
  creatingScenes?: boolean
  writingScript?: boolean
  generatingAudio?: boolean
  generatingStill?: boolean
  generatingVideo?: boolean
  stillsProgress?: number
  stillsProgressLabel?: string
  videoProgressLabel?: string
  videoProgress?: number
  busy?: boolean
  onTabChange: (tab: UgcWorkbenchTab) => void
  onTypeChange: (type: UgcClipType) => void
  onAddClip: (type: UgcClipType) => void
  onUseStarter: () => void
  onImageSubmit: (result: ImagePromptSubmitResult) => void
  onVideoSubmit: (result: VideoPromptSubmitResult) => void
  onScriptChange: (text: string) => void
  onWriteScript: () => void
  onVoiceChange: (voice: UgcClipVoice) => void
  onGenerateAudio: (script?: string) => void
  onUseStills: (urls: string[]) => void
  onSelectAudio?: (url: string) => void
}

export function UgcSceneWorkbench({
  project,
  clip,
  tab,
  videoAttachments,
  creatingScenes,
  writingScript,
  generatingAudio,
  generatingStill,
  generatingVideo,
  stillsProgress,
  stillsProgressLabel,
  videoProgressLabel,
  videoProgress,
  busy,
  onTabChange,
  onTypeChange,
  onAddClip,
  onUseStarter,
  onImageSubmit,
  onVideoSubmit,
  onScriptChange,
  onWriteScript,
  onVoiceChange,
  onGenerateAudio,
  onUseStills,
  onSelectAudio,
}: UgcSceneWorkbenchProps) {
  const imageModels = useUgcProjectStore(s => s.imageModels)
  const videoModels = useUgcProjectStore(s => s.videoModels)
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const [selectedStillUrls, setSelectedStillUrls] = useState<string[]>([])

  const imageAttachments = useMemo(() => {
    if (!clip) return []
    return campaignAttachments(project, clip, influencersById)
  }, [clip, influencersById, project])

  const generatedStills = useMemo(
    () => (clip ? ugcClipGeneratedStills(clip, project.productImageUrls) : []),
    [clip, project.productImageUrls],
  )

  const stillUrls = useMemo(
    () => generatedStills.flatMap(still => (still.imageUrl ? [still.imageUrl] : [])),
    [generatedStills],
  )

  useEffect(() => {
    setSelectedStillUrls(current => {
      const kept = current.filter(url => stillUrls.includes(url))
      if (kept.length > 0) return kept
      const newest = stillUrls[0]
      return newest ? [newest] : []
    })
  }, [stillUrls])

  if (!clip) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-[15px] font-medium tracking-tight">Start with a scene</p>
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Use a 3-scene template, or add one talking shot. Then generate a photo, voiceover, and clip.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" disabled={creatingScenes} onClick={onUseStarter}>
            Use a 3-scene ad
          </Button>
          <UgcAddSceneMenu clips={project.clips} creating={creatingScenes} align="center" onAdd={onAddClip}>
            <Button type="button" variant="outline" disabled={creatingScenes}>
              Add a scene
            </Button>
          </UgcAddSceneMenu>
        </div>
      </div>
    )
  }

  const hasStills = stillUrls.length > 0
  const hasVideo = Boolean(clip.videoUrl)
  const showsScript = ugcClipShowsScript(clip.type)
  const audioTakes = ugcClipAudioTakes(clip)
  const resolvedImageModel = ugcResolvedClipModels(project, clip).image
  const clipIndex = project.clips.findIndex(item => item.id === clip.id)

  const toggleStill = (url: string) => {
    setSelectedStillUrls(current =>
      current.includes(url) ? current.filter(item => item !== url) : [...current, url],
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] px-4 dark:border-white/[0.08] lg:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {String(Math.max(clipIndex, 0) + 1).padStart(2, '0')}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 text-[13px] font-medium tracking-tight hover:bg-muted"
              >
                <span className="truncate">{clip.name ?? UGC_CLIP_TYPE_LABELS[clip.type]}</span>
                <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              {UGC_CLIP_TYPES.map(type => (
                <DropdownMenuItem key={type} onClick={() => onTypeChange(type)}>
                  {UGC_CLIP_TYPE_LABELS[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{clip.durationSec}s</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5 lg:px-6 lg:py-6">
          {tab === 'image' ? (
            <>
              {generatingStill ? (
                <UgcGenerationStatus
                  kind="still"
                  generating
                  progress={stillsProgress}
                  progressLabel={stillsProgressLabel}
                />
              ) : null}
              {hasStills ? (
                <UgcStillsGrid
                  stills={generatedStills}
                  selectedUrls={selectedStillUrls}
                  generating={generatingStill}
                  onToggle={toggleStill}
                  onUseSelected={() => onUseStills(selectedStillUrls)}
                />
              ) : !generatingStill ? (
                <UgcStillsEmptyHint />
              ) : null}
            </>
          ) : null}

          {tab === 'audio' && showsScript ? (
            <>
              {generatingAudio ? (
                <UgcGenerationStatus kind="audio" generating progressLabel="Generating voiceover…" />
              ) : null}
              {audioTakes.length > 0 ? (
                <UgcAudioTakes
                  takes={audioTakes}
                  selectedUrl={clip.audioUrl}
                  disabled={busy}
                  onSelect={onSelectAudio}
                />
              ) : !generatingAudio ? (
                <UgcAudioEmptyHint />
              ) : null}
            </>
          ) : null}

          {tab === 'video' ? (
            <>
              {generatingVideo ? (
                <UgcGenerationStatus
                  kind="video"
                  generating
                  progress={videoProgress}
                  progressLabel={videoProgressLabel}
                />
              ) : null}
              {hasVideo && clip.videoUrl ? (
                <UgcPhonePreview
                  key={clip.videoUrl}
                  src={clip.videoUrl}
                  poster={clip.thumbnailUrl ?? stillUrls[0]}
                  aspectRatio={project.aspectRatio}
                />
              ) : !generatingVideo ? (
                <>
                  <UgcVideoEmptyHint />
                  {hasStills && videoAttachments.length > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      {videoAttachments.map(item => (
                        <div
                          key={item.id}
                          className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted"
                        >
                          <Image
                            alt={item.label ?? ''}
                            src={item.url}
                            fill
                            className="object-cover"
                            sizes="44px"
                            unoptimized
                          />
                        </div>
                      ))}
                      <p className="text-[12px] text-muted-foreground">Start frame ready</p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="relative shrink-0">
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent" />
        <div className="border-t border-black/[0.06] bg-background dark:border-white/[0.08]">
          <div className="mx-auto w-full max-w-3xl px-4 py-2.5 lg:px-6">
            <Tabs value={tab} onValueChange={value => onTabChange(value as UgcWorkbenchTab)} className="gap-2.5">
              <TabsList className="h-8 w-fit bg-muted/70 p-0.5">
                <TabsTrigger value="image" className="h-7 gap-1.5 px-2.5 text-[12px]">
                  <ImageIcon data-icon="inline-start" className="size-3.5" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="audio" className="h-7 gap-1.5 px-2.5 text-[12px]">
                  <AudioLinesIcon data-icon="inline-start" className="size-3.5" />
                  Audio
                </TabsTrigger>
                <TabsTrigger value="video" className="h-7 gap-1.5 px-2.5 text-[12px]">
                  <VideoIcon data-icon="inline-start" className="size-3.5" />
                  Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="mt-0 data-[state=inactive]:hidden">
                <ImagePromptInput
                  key={`${clip.id}-image`}
                  models={imageModels}
                  hideExtras
                  pending={generatingStill}
                  initialAttachments={imageAttachments}
                  initialAspectRatio={project.aspectRatio}
                  initialModel={resolvedImageModel}
                  placeholder="Describe the scene photo…"
                  onSubmitOverride={onImageSubmit}
                />
              </TabsContent>

              <TabsContent value="audio" className="mt-0 data-[state=inactive]:hidden">
                <UgcAudioPromptInput
                  project={project}
                  clip={clip}
                  writingScript={writingScript}
                  generatingAudio={generatingAudio}
                  busy={busy || generatingStill || generatingVideo}
                  onScriptChange={onScriptChange}
                  onWriteScript={onWriteScript}
                  onVoiceChange={onVoiceChange}
                  onGenerateAudio={script => onGenerateAudio(script)}
                />
              </TabsContent>

              <TabsContent value="video" className="mt-0 space-y-2 data-[state=inactive]:hidden">
                {!hasStills && !hasVideo ? (
                  <p className="px-0.5 text-[12px] text-muted-foreground">
                    Generate a photo first, then animate it here.
                  </p>
                ) : null}
                <VideoPromptInput
                  key={`${clip.id}-video`}
                  models={videoModels}
                  hideExtras
                  pending={generatingVideo}
                  initialAttachments={videoAttachments}
                  initialAspectRatio={project.aspectRatio}
                  placeholder="Describe the video motion…"
                  onSubmitOverride={onVideoSubmit}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

function campaignAttachments(
  project: UgcProject,
  clip: UgcClip,
  influencersById: Record<string, { coverImageUrl?: string; galleryImageUrls: string[]; name: string }>,
): AttachedMedia[] {
  const items: AttachedMedia[] = []
  const influencerId = ugcResolvedInfluencerId(project, clip)
  const creator = influencerId ? influencersById[influencerId] : undefined
  const creatorSrc = creator?.coverImageUrl || creator?.galleryImageUrls[0]
  if (creatorSrc && influencerId) {
    items.push({
      id: `creator-${influencerId}`,
      url: creatorSrc,
      kind: 'image',
      source: 'influencer',
      label: creator?.name ?? 'Creator',
      influencerId,
    })
  }
  if (ugcClipRequiresProduct(clip.type)) {
    const productSrc = project.productImageUrls[0]
    if (productSrc) {
      items.push({
        id: `product-${productSrc}`,
        url: productSrc,
        kind: 'image',
        source: 'product',
        label: project.productName ?? 'Product',
        productId: project.productId,
      })
    }
  }
  return items.slice(0, 3)
}
