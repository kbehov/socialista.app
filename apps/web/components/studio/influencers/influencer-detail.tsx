'use client'

import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getInfluencer } from '@/services/influencer.service'
import type { Influencer } from '@socialista/types'
import { ArrowLeftIcon, LoaderCircleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type InfluencerDetailProps = {
  initialInfluencer: Influencer
}

export function InfluencerDetail({ initialInfluencer }: InfluencerDetailProps) {
  const [influencer, setInfluencer] = useState(initialInfluencer)

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

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCERS} aria-label="Back">
              <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-[1.5rem] font-semibold tracking-[-0.03em] sm:text-[1.75rem]">
              {influencer.name}
            </h1>
            <p className="text-[13px] text-muted-foreground capitalize">
              {influencer.status}
              {influencer.niche.length > 0 ? ` · ${influencer.niche.join(', ')}` : ''}
            </p>
          </div>
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
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(influencer.galleryImageUrls.length > 0
                ? influencer.galleryImageUrls
                : influencer.coverImageUrl
                  ? [influencer.coverImageUrl]
                  : []
              ).map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative aspect-3/4 overflow-hidden rounded-2xl bg-muted/30 ring-1 ring-border/40"
                >
                  <Image
                    src={url}
                    alt={`${influencer.name} anchor ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                </div>
              ))}
            </div>

            {influencer.bio ? (
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{influencer.bio}</p>
            ) : null}

            <div className="rounded-2xl bg-muted/20 p-5 ring-1 ring-border/40">
              <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
                Identity
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">
                {influencer.identity.basePromptFragment}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
