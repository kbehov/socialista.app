'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import type { TikTokExtractResult } from '@/lib/tiktok/extract'
import { cn } from '@/lib/utils'
import { BadgeCheck, Bookmark, Heart, MessageCircle, Play, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type TikTokPostCardProps = {
  post: TikTokExtractResult
  className?: string
}

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return String(value)
}

function StatAction({
  icon: Icon,
  count,
  label,
}: {
  icon: typeof Heart
  count: number
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
        <Icon className="size-5 text-white" strokeWidth={1.75} />
      </div>
      <span className="text-[10px] font-medium text-white/90">{formatCount(count)}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}

function TikTokSlideshow({ slides }: { slides: string[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return

    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  return (
    <Carousel
      setApi={setApi}
      draggable
      opts={{ loop: true }}
      className="absolute inset-0 size-full cursor-grab active:cursor-grabbing"
    >
      <CarouselContent className="ml-0 h-full">
        {slides.map((src, index) => (
          <CarouselItem key={src} className="h-full pl-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Slide ${index + 1} of ${slides.length}`}
              draggable={false}
              className="pointer-events-none size-full select-none object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/10 via-transparent to-black/70" />

      {slides.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-2 top-2 z-20 flex gap-0.5">
            {slides.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  index === current ? 'bg-white' : 'bg-white/35',
                )}
              />
            ))}
          </div>

          <CarouselPrevious
            variant="ghost"
            size="icon"
            className="top-1/2 left-1.5 z-20 size-8 -translate-y-1/2 border-0 bg-black/30 text-white shadow-none backdrop-blur-sm hover:bg-black/50 hover:text-white disabled:opacity-40"
          />
          <CarouselNext
            variant="ghost"
            size="icon"
            className="top-1/2 right-1.5 left-auto z-20 size-8 -translate-y-1/2 border-0 bg-black/30 text-white shadow-none backdrop-blur-sm hover:bg-black/50 hover:text-white disabled:opacity-40"
          />
        </>
      )}
    </Carousel>
  )
}

export function TikTokPostCard({ post, className }: TikTokPostCardProps) {
  const slides = post.type === 'slideshow' ? post.imageUrls : []
  const poster = post.imageUrls[0]
  const videoUrl = post.videoUrls[0]

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10',
        className,
      )}
    >
      <div className="relative aspect-[9/16] w-full">
        {post.type === 'slideshow' && slides.length > 0 ? (
          <TikTokSlideshow slides={slides} />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            poster={poster}
            controls
            playsInline
            className="absolute inset-0 size-full object-cover"
          />
        ) : poster ? (
          <div className="relative size-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Play className="ml-0.5 size-7 fill-white text-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex size-full items-center justify-center bg-zinc-900 text-sm text-white/50">
            No media
          </div>
        )}

        {post.type !== 'slideshow' && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        )}

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex items-end gap-3 p-3',
            post.type === 'video' && videoUrl && 'pb-10',
          )}
        >
          <div className="min-w-0 flex-1 space-y-1.5 pb-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm font-semibold text-white">@{post.author.username}</span>
              {post.author.verified && (
                <BadgeCheck className="size-3.5 shrink-0 fill-white text-black" aria-label="Verified" />
              )}
            </div>
            <p className="line-clamp-3 text-xs leading-relaxed text-white/90">{post.description}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">
              {post.type === 'slideshow' ? 'Slideshow' : 'Video'}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 pb-1">
            <Avatar className="size-10 ring-2 ring-white/20">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.nickname} />
              <AvatarFallback className="bg-zinc-800 text-xs text-white">
                {post.author.nickname.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <StatAction icon={Heart} count={post.stats.likes} label="Likes" />
            <StatAction icon={MessageCircle} count={post.stats.comments} label="Comments" />
            <StatAction icon={Bookmark} count={post.stats.bookmarks} label="Bookmarks" />
            <StatAction icon={Share2} count={post.stats.shares} label="Shares" />
          </div>
        </div>
      </div>
    </div>
  )
}
