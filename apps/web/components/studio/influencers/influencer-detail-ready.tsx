'use client'

import { FilePreview } from '@/components/media/file-preview'
import { InfluencerProfileAvatar } from '@/components/studio/influencers/influencer-profile-avatar'
import { InfluencerProfileBio } from '@/components/studio/influencers/influencer-profile-bio'
import { InfluencerProfileGridCell } from '@/components/studio/influencers/influencer-profile-grid-cell'
import { InfluencerProfileStat } from '@/components/studio/influencers/influencer-profile-stat'
import { Button } from '@/components/ui/button'
import type { Influencer, InfluencerHookVideo, Model } from '@socialista/types'
import { ImagePlusIcon, PlusIcon, VideoIcon } from 'lucide-react'

type InfluencerDetailReadyProps = {
  influencer: Influencer
  galleryUrls: string[]
  identityReferenceUrl: string | null
  videosBySource: Map<string, InfluencerHookVideo[]>
  nicheText: string
  canMutate: boolean
  imageModels: Model[]
  videoModels: Model[]
  hookVideos: InfluencerHookVideo[] | undefined
  onOpenScene: () => void
  onGenerateHook: (sourceImageUrl: string) => void
  onPreviewHookClip: (clip: InfluencerHookVideo) => void
}

export function InfluencerDetailReady({
  influencer,
  galleryUrls,
  identityReferenceUrl,
  videosBySource,
  nicheText,
  canMutate,
  imageModels,
  videoModels,
  hookVideos,
  onOpenScene,
  onGenerateHook,
  onPreviewHookClip,
}: InfluencerDetailReadyProps) {
  const hookCount = hookVideos?.length ?? 0

  return (
    <div>
      <div className="flex items-start gap-5 sm:gap-8">
        {identityReferenceUrl ? (
          <InfluencerProfileAvatar imageUrl={identityReferenceUrl} name={influencer.name} />
        ) : (
          <div className="size-20 shrink-0 rounded-full bg-muted/40 outline outline-1 outline-[oklch(0_0_0/0.1)] sm:size-24 dark:outline-[oklch(1_0_0/0.1)]" />
        )}

        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="truncate text-[1.35rem] font-semibold tracking-[-0.03em] sm:text-[1.5rem]">
            {influencer.name}
          </h1>
          {nicheText ? <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{nicheText}</p> : null}

          <div className="mt-3 flex gap-5">
            <InfluencerProfileStat value={galleryUrls.length} label={galleryUrls.length === 1 ? 'photo' : 'photos'} />
            <InfluencerProfileStat value={hookCount} label={hookCount === 1 ? 'hook' : 'hooks'} />
          </div>
        </div>
      </div>

      <InfluencerProfileBio bio={influencer.bio} identity={influencer.identity.basePromptFragment} />

      {canMutate ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs active:scale-[0.96]"
            disabled={!identityReferenceUrl || imageModels.length === 0}
            onClick={onOpenScene}
          >
            <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
            New photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs active:scale-[0.96]"
            disabled={!identityReferenceUrl || videoModels.length === 0}
            onClick={() => {
              if (identityReferenceUrl) onGenerateHook(identityReferenceUrl)
            }}
          >
            <VideoIcon className="size-3.5" strokeWidth={1.75} />
            New hook
          </Button>
        </div>
      ) : null}

      <section className="mt-8">
        <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">Posts</p>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl">
          {canMutate ? (
            <button
              type="button"
              onClick={onOpenScene}
              disabled={!identityReferenceUrl || imageModels.length === 0}
              className="flex aspect-square items-center justify-center bg-muted/25 text-muted-foreground outline outline-1 outline-[oklch(0_0_0/0.1)] transition-[scale,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-muted/40 active:scale-[0.96] disabled:opacity-40 dark:outline-[oklch(1_0_0/0.1)]"
              aria-label="Add photo"
            >
              <PlusIcon className="size-7" strokeWidth={1.5} />
            </button>
          ) : null}
          {galleryUrls.map((url, index) => (
            <InfluencerProfileGridCell
              key={`${url}-${index}`}
              url={url}
              name={influencer.name}
              index={index}
              hasClips={(videosBySource.get(url) ?? []).length > 0}
              canGenerateHook={canMutate}
              onGenerateHook={() => onGenerateHook(url)}
            />
          ))}
        </div>
      </section>

      {hookVideos && hookVideos.length > 0 ? (
        <section className="mt-8">
          <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">Hooks</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {hookVideos.map(clip => (
              <button
                key={clip._id}
                type="button"
                aria-label="Play hook video"
                onClick={() => onPreviewHookClip(clip)}
                className="group relative aspect-9/16 w-[7.5rem] shrink-0 overflow-hidden rounded-xl bg-muted/30 outline outline-1 outline-[oklch(0_0_0/0.1)] transition-[scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] dark:outline-[oklch(1_0_0/0.1)]"
              >
                <FilePreview
                  src={clip.videoUrl}
                  alt={`Hook video from ${influencer.name}`}
                  kind="video"
                  hoverPlay
                  showBadge
                />
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
