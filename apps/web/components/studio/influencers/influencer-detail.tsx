'use client'

import { InfluencerDetailFailed } from '@/components/studio/influencers/influencer-detail-failed'
import { InfluencerDetailGenerating } from '@/components/studio/influencers/influencer-detail-generating'
import { InfluencerDetailReady } from '@/components/studio/influencers/influencer-detail-ready'
import { InfluencerHookVideoDialog } from '@/components/studio/influencers/influencer-hook-video-dialog'
import { InfluencerHookVideoPreviewDialog } from '@/components/studio/influencers/influencer-hook-video-preview-dialog'
import { InfluencerSceneDialog } from '@/components/studio/influencers/influencer-scene-dialog'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { formatInfluencerNiches } from '@/lib/studio/influencers/niche-label'
import { getInfluencer } from '@/services/influencer.service'
import type { Influencer, InfluencerHookVideo, Model } from '@socialista/types'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type InfluencerDetailProps = {
  initialInfluencer: Influencer
  videoModels: Model[]
  imageModels: Model[]
}

export function InfluencerDetail({ initialInfluencer, videoModels, imageModels }: InfluencerDetailProps) {
  const [influencer, setInfluencer] = useState(initialInfluencer)
  const [hookSourceUrl, setHookSourceUrl] = useState<string | null>(null)
  const [sceneOpen, setSceneOpen] = useState(false)
  const [previewHookClip, setPreviewHookClip] = useState<InfluencerHookVideo | null>(null)

  useEffect(() => {
    if (influencer.status !== 'generating') return

    let cancelled = false
    const poll = async () => {
      const response = await getInfluencer(influencer._id)
      if (cancelled || !response.success || !response.data?.influencer) return
      setInfluencer(response.data.influencer)
    }

    const id = window.setInterval(() => {
      void poll()
    }, 2500)
    void poll()

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [influencer._id, influencer.status])

  const isGenerating = influencer.status === 'generating'
  const isFailed = influencer.status === 'failed'
  const canMutate = influencer.status === 'ready' && Boolean(influencer.workspaceId)

  const galleryUrls = useMemo(
    () =>
      influencer.galleryImageUrls.length > 0
        ? influencer.galleryImageUrls
        : influencer.coverImageUrl
          ? [influencer.coverImageUrl]
          : [],
    [influencer.coverImageUrl, influencer.galleryImageUrls],
  )

  const identityReferenceUrl = influencer.coverImageUrl || galleryUrls[0] || null
  const hookVideos = influencer.hookVideos

  const videosBySource = useMemo(() => {
    const map = new Map<string, InfluencerHookVideo[]>()
    for (const video of hookVideos ?? []) {
      const existing = map.get(video.sourceImageUrl) ?? []
      existing.push(video)
      map.set(video.sourceImageUrl, existing)
    }
    return map
  }, [hookVideos])

  const nicheText = formatInfluencerNiches(influencer.niche)

  const refreshInfluencer = async () => {
    const response = await getInfluencer(influencer._id)
    if (response.success && response.data?.influencer) {
      setInfluencer(response.data.influencer)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-6">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCERS} aria-label="Back">
              <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
            </Link>
          </Button>
        </div>

        {isGenerating ? <InfluencerDetailGenerating name={influencer.name} /> : null}
        {isFailed ? <InfluencerDetailFailed error={influencer.error} /> : null}

        {influencer.status === 'ready' ? (
          <InfluencerDetailReady
            influencer={influencer}
            galleryUrls={galleryUrls}
            identityReferenceUrl={identityReferenceUrl}
            videosBySource={videosBySource}
            nicheText={nicheText}
            canMutate={canMutate}
            imageModels={imageModels}
            videoModels={videoModels}
            hookVideos={hookVideos}
            onOpenScene={() => setSceneOpen(true)}
            onGenerateHook={setHookSourceUrl}
            onPreviewHookClip={setPreviewHookClip}
          />
        ) : null}
      </div>

      {hookSourceUrl ? (
        <InfluencerHookVideoDialog
          open
          onOpenChange={open => {
            if (!open) setHookSourceUrl(null)
          }}
          influencerId={influencer._id}
          influencerName={influencer.name}
          sourceImageUrl={hookSourceUrl}
          models={videoModels}
          onGenerated={() => {
            void refreshInfluencer()
          }}
        />
      ) : null}

      {sceneOpen && identityReferenceUrl ? (
        <InfluencerSceneDialog
          open
          onOpenChange={open => {
            if (!open) setSceneOpen(false)
          }}
          influencerId={influencer._id}
          influencerName={influencer.name}
          sourceImageUrl={identityReferenceUrl}
          models={imageModels}
          onGenerated={() => {
            void refreshInfluencer()
          }}
        />
      ) : null}

      <InfluencerHookVideoPreviewDialog
        clip={previewHookClip}
        onOpenChange={open => {
          if (!open) setPreviewHookClip(null)
        }}
      />
    </div>
  )
}
