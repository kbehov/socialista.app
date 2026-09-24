'use client'

import { FilePreview } from '@/components/media/file-preview'
import { InfluencerHookVideoDialog } from '@/components/studio/influencers/influencer-hook-video-dialog'
import { InfluencerSceneDialog } from '@/components/studio/influencers/influencer-scene-dialog'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { NICHE_OPTIONS } from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import { getInfluencer } from '@/services/influencer.service'
import type { Influencer, InfluencerHookVideo, Model } from '@socialista/types'
import { ArrowLeftIcon, ImagePlusIcon, LoaderCircleIcon, PlayIcon, PlusIcon, VideoIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type InfluencerDetailProps = {
  initialInfluencer: Influencer
  videoModels: Model[]
  imageModels: Model[]
}

function nicheLabel(id: string): string {
  return NICHE_OPTIONS.find(option => option.id === id)?.label ?? id
}

function ProfileBio({ bio, identity }: { bio?: string; identity: string }) {
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el || expanded) return
    setCanExpand(el.scrollHeight > el.clientHeight + 1)
  }, [identity, expanded])

  if (!bio && !identity) return null

  return (
    <div className="mt-4 max-w-xl">
      {bio ? <p className="text-[14px] leading-snug tracking-[-0.01em]">{bio}</p> : null}
      {identity ? (
        <p
          ref={textRef}
          className={cn(
            'text-[13px] leading-relaxed text-muted-foreground',
            bio && 'mt-1',
            !expanded && 'line-clamp-4',
          )}
        >
          {identity}
        </p>
      ) : null}
      {canExpand || expanded ? (
        <button
          type="button"
          className="mt-0.5 text-[13px] font-semibold tracking-[-0.01em] text-foreground/80 transition-[opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:opacity-70"
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'less' : 'more'}
        </button>
      ) : null}
    </div>
  )
}

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[4.5rem]">
      <p className="text-[15px] font-semibold tabular-nums tracking-[-0.02em]">{value}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </div>
  )
}

type GridCellProps = {
  url: string
  name: string
  index: number
  hasClips: boolean
  canGenerateHook: boolean
  onGenerateHook: () => void
}

function ProfileGridCell({ url, name, index, hasClips, canGenerateHook, onGenerateHook }: GridCellProps) {
  return (
    <div className="group/cell relative aspect-square overflow-hidden bg-muted/30 outline outline-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)]">
      <Image
        src={url}
        alt={`${name} ${index + 1}`}
        fill
        unoptimized
        className="object-cover"
        sizes="(max-width: 640px) 33vw, 220px"
      />
      {hasClips ? (
        <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
          <PlayIcon className="size-3 translate-x-px" fill="currentColor" strokeWidth={0} />
        </span>
      ) : null}
      {canGenerateHook ? (
        <button
          type="button"
          onClick={onGenerateHook}
          className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-[opacity,scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover/cell:opacity-100 group-focus-within/cell:opacity-100 max-sm:opacity-100 active:scale-[0.96]"
        >
          <VideoIcon className="size-3" strokeWidth={1.75} />
          Hook
        </button>
      ) : null}
    </div>
  )
}

export function InfluencerDetail({ initialInfluencer, videoModels, imageModels }: InfluencerDetailProps) {
  const [influencer, setInfluencer] = useState(initialInfluencer)
  const [hookSourceUrl, setHookSourceUrl] = useState<string | null>(null)
  const [sceneOpen, setSceneOpen] = useState(false)

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

  const nicheText = influencer.niche.map(nicheLabel).filter(Boolean).join(' · ')

  const refreshInfluencer = async () => {
    const response = await getInfluencer(influencer._id)
    if (response.success && response.data?.influencer) {
      setInfluencer(response.data.influencer)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-6">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCERS} aria-label="Back">
              <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
            </Link>
          </Button>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/20 px-6 py-20 ring-1 ring-border/40">
            <LoaderCircleIcon className="size-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-4 text-[15px] font-medium tracking-[-0.02em]">Generating identity anchors…</p>
            <p className="mt-1 max-w-sm text-center text-[13px] text-muted-foreground">
              Creating consistent portraits for {influencer.name}. This usually takes a minute.
            </p>
          </div>
        ) : null}

        {isFailed ? (
          <div className="rounded-2xl bg-destructive/5 px-6 py-8 ring-1 ring-destructive/20">
            <p className="font-medium text-destructive">Generation failed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {influencer.error ?? 'Something went wrong. Try creating again.'}
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-xl">
              <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}>Create another</Link>
            </Button>
          </div>
        ) : null}

        {influencer.status === 'ready' ? (
          <div>
            <div className="flex items-start gap-5 sm:gap-8">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted/40 outline outline-1 outline-[oklch(0_0_0/0.1)] sm:size-24 dark:outline-[oklch(1_0_0/0.1)]">
                {identityReferenceUrl ? (
                  <Image
                    src={identityReferenceUrl}
                    alt={influencer.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="96px"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h1 className="truncate text-[1.35rem] font-semibold tracking-[-0.03em] sm:text-[1.5rem]">
                  {influencer.name}
                </h1>
                {nicheText ? (
                  <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{nicheText}</p>
                ) : null}

                <div className="mt-3 flex gap-5">
                  <ProfileStat value={galleryUrls.length} label={galleryUrls.length === 1 ? 'photo' : 'photos'} />
                  <ProfileStat
                    value={hookVideos?.length ?? 0}
                    label={(hookVideos?.length ?? 0) === 1 ? 'hook' : 'hooks'}
                  />
                </div>
              </div>
            </div>

            <ProfileBio bio={influencer.bio} identity={influencer.identity.basePromptFragment} />

            {canMutate ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full active:scale-[0.96]"
                  disabled={!identityReferenceUrl || imageModels.length === 0}
                  onClick={() => setSceneOpen(true)}
                >
                  <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
                  New photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full active:scale-[0.96]"
                  disabled={!identityReferenceUrl || videoModels.length === 0}
                  onClick={() => {
                    if (identityReferenceUrl) setHookSourceUrl(identityReferenceUrl)
                  }}
                >
                  <VideoIcon className="size-3.5" strokeWidth={1.75} />
                  New hook
                </Button>
              </div>
            ) : null}

            <section className="mt-8">
              <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                Posts
              </p>
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl">
                {canMutate ? (
                  <button
                    type="button"
                    onClick={() => setSceneOpen(true)}
                    disabled={!identityReferenceUrl || imageModels.length === 0}
                    className="flex aspect-square items-center justify-center bg-muted/25 text-muted-foreground outline outline-1 outline-[oklch(0_0_0/0.1)] transition-[scale,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-muted/40 active:scale-[0.96] disabled:opacity-40 dark:outline-[oklch(1_0_0/0.1)]"
                    aria-label="Add photo"
                  >
                    <PlusIcon className="size-7" strokeWidth={1.5} />
                  </button>
                ) : null}
                {galleryUrls.map((url, index) => (
                  <ProfileGridCell
                    key={`${url}-${index}`}
                    url={url}
                    name={influencer.name}
                    index={index}
                    hasClips={(videosBySource.get(url) ?? []).length > 0}
                    canGenerateHook={canMutate}
                    onGenerateHook={() => setHookSourceUrl(url)}
                  />
                ))}
              </div>
            </section>

            {hookVideos && hookVideos.length > 0 ? (
              <section className="mt-8">
                <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                  Hooks
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {hookVideos.map(clip => (
                    <Link
                      key={clip._id}
                      href={DASHBOARD_ROUTES.STUDIO.video(clip.videoId)}
                      className="group relative aspect-9/16 w-[7.5rem] shrink-0 overflow-hidden rounded-xl bg-muted/30 outline outline-1 outline-[oklch(0_0_0/0.1)] transition-[scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] dark:outline-[oklch(1_0_0/0.1)]"
                    >
                      <FilePreview
                        src={clip.videoUrl}
                        alt={`Hook video from ${influencer.name}`}
                        kind="video"
                        hoverPlay
                        showBadge
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
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
    </div>
  )
}
