'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Carousel, CarouselContent, CarouselItem, useCarousel, type CarouselApi } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { formatCount } from '@/utils/math'
import type { InspirationResponse } from '@socialista/types'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ImagesIcon,
  MessageCircleIcon,
  PlayIcon,
  Share2Icon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type InspirationCardProps = {
  inspiration: InspirationResponse
}

const slideshowNavButtonClass =
  'absolute top-1/2 z-30 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50'

function SlideshowNavButtons() {
  const { scrollPrev, scrollNext } = useCarousel()

  return (
    <>
      <button
        type="button"
        aria-label="Previous slide"
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.stopPropagation()
          scrollPrev()
        }}
        className={cn(slideshowNavButtonClass, 'left-2')}
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.stopPropagation()
          scrollNext()
        }}
        className={cn(slideshowNavButtonClass, 'right-2')}
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </>
  )
}

function SlideshowMedia({ images }: { images: InspirationResponse['images'] }) {
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
    <Carousel setApi={setApi} opts={{ loop: true }} className="absolute inset-0 size-full">
      <CarouselContent className="ml-0 h-full">
        {images.map((image, index) => (
          <CarouselItem key={image.url} className="h-full pl-0 cursor-grab active:cursor-grabbing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={`Slide ${index + 1}`}
              className="pointer-events-none size-full select-none object-cover"
              draggable={false}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      {images.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-2 top-2 z-20 flex gap-0.5">
            {images.map((image, index) => (
              <div
                key={image.url}
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  index === current ? 'bg-white' : 'bg-white/35',
                )}
              />
            ))}
          </div>

          <SlideshowNavButtons />
        </>
      )}
    </Carousel>
  )
}

function MediaPlaceholder() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
      <ImagesIcon className="size-5 opacity-50" strokeWidth={1.5} />
      <span className="text-[11px]">No preview</span>
    </div>
  )
}

function VideoMedia({ videoUrl, posterUrl }: { videoUrl: string; posterUrl?: string }) {
  return (
    <video
      src={videoUrl}
      poster={posterUrl}
      controls
      playsInline
      preload="metadata"
      className="absolute inset-0 size-full bg-black object-cover"
    />
  )
}

function VideoPoster({ posterUrl }: { posterUrl: string }) {
  return (
    <div className="relative size-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={posterUrl} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
          <PlayIcon className="ml-0.5 size-4 fill-current" />
        </div>
      </div>
    </div>
  )
}

export function InspirationCard({ inspiration }: InspirationCardProps) {
  const author = inspiration.author.nickName || inspiration.author.username || 'Unknown'
  const handle = inspiration.author.username ? `@${inspiration.author.username}` : null
  const isSlideshow = inspiration.contentType === 'slideshow'
  const videoUrl = inspiration.video.playUrl ?? inspiration.video.downloadUrl
  const posterUrl = inspiration.video.coverUrl
  const tags = [...inspiration.categories.map(c => c.name), ...inspiration.niches.map(n => n.name)]

  return (
    <div className="group">
      <div className="relative aspect-9/16 overflow-hidden rounded-xl bg-black ring-1 ring-border/60 transition-[box-shadow,ring-color] duration-200 group-hover:ring-border">
        {isSlideshow && inspiration.images.length > 0 ? (
          <SlideshowMedia images={inspiration.images} />
        ) : videoUrl ? (
          <VideoMedia videoUrl={videoUrl} posterUrl={posterUrl} />
        ) : posterUrl ? (
          <VideoPoster posterUrl={posterUrl} />
        ) : (
          <MediaPlaceholder />
        )}
      </div>

      <div className="mt-2.5 space-y-2 px-0.5">
        <div className="flex items-center gap-2">
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={inspiration.author.avatarUrl} alt={author} />
            <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
              {author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none text-foreground">{author}</p>
            {handle && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{handle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] tabular-nums text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <HeartIcon className="size-3" strokeWidth={1.75} />
            {formatCount(inspiration.stats.likes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircleIcon className="size-3" strokeWidth={1.75} />
            {formatCount(inspiration.stats.comments)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Share2Icon className="size-3" strokeWidth={1.75} />
            {formatCount(inspiration.stats.shares)}
          </span>
        </div>

        {tags.length > 0 && (
          <p className="truncate text-[11px] leading-snug text-muted-foreground/80">{tags.join(' · ')}</p>
        )}
      </div>
    </div>
  )
}
