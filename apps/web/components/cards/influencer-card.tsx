'use client'

import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  type CarouselApi,
} from '@/components/ui/carousel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { NICHE_OPTIONS } from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/format'
import type { Influencer, InfluencerStatus } from '@socialista/types'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  Trash2Icon,
  UserRoundIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type InfluencerCardProps = {
  influencer: Influencer
  /** When omitted, the overflow delete action is hidden (e.g. public library). */
  onDelete?: (influencer: Influencer) => void
}

const STATUS_LABEL: Record<InfluencerStatus, string> = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Ready',
  failed: 'Failed',
}

const NAV_BUTTON_CLASS =
  'absolute top-1/2 z-30 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-[opacity,background-color] duration-150 hover:bg-black/55'

function nicheLabel(id: string): string {
  return NICHE_OPTIONS.find(option => option.id === id)?.label ?? id
}

function collectImages(influencer: Influencer): string[] {
  const gallery = influencer.galleryImageUrls.filter(Boolean)
  if (gallery.length > 0) return gallery
  if (influencer.coverImageUrl) return [influencer.coverImageUrl]
  return []
}

function StatusDot({ status }: { status: InfluencerStatus }) {
  return (
    <span
      className={cn(
        'size-1.5 shrink-0 rounded-full',
        status === 'ready' && 'bg-emerald-500',
        status === 'generating' && 'animate-pulse bg-amber-500',
        status === 'failed' && 'bg-destructive',
        status === 'draft' && 'bg-muted-foreground/45',
      )}
      aria-hidden
    />
  )
}

function CoverNavButtons() {
  const { scrollPrev, scrollNext } = useCarousel()

  return (
    <>
      <button
        type="button"
        aria-label="Previous image"
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.preventDefault()
          event.stopPropagation()
          scrollPrev()
        }}
        className={cn(
          NAV_BUTTON_CLASS,
          'left-1.5 opacity-0 group-hover/media:opacity-100 max-sm:opacity-100',
        )}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Next image"
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.preventDefault()
          event.stopPropagation()
          scrollNext()
        }}
        className={cn(
          NAV_BUTTON_CLASS,
          'right-1.5 opacity-0 group-hover/media:opacity-100 max-sm:opacity-100',
        )}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={2} />
      </button>
    </>
  )
}

function CoverCarousel({
  images,
  name,
  href,
}: {
  images: string[]
  name: string
  href: string
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const hasMultiple = images.length > 1

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
    <Carousel setApi={setApi} opts={{ loop: hasMultiple }} className="absolute inset-0 size-full">
      <CarouselContent className="ml-0 h-full">
        {images.map((url, index) => (
          <CarouselItem
            key={`${url}-${index}`}
            className="relative h-full cursor-grab pl-0 active:cursor-grabbing"
          >
            <Link
              href={href}
              className="absolute inset-0 block focus-visible:outline-none"
              aria-label={`Open ${name}`}
              draggable={false}
            >
              <Image
                src={url}
                alt={`${name} ${index + 1}`}
                fill
                unoptimized
                draggable={false}
                className="pointer-events-none select-none object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {hasMultiple ? (
        <>
          <div className="pointer-events-none absolute inset-x-2 top-2 z-20 flex gap-1">
            {images.map((url, index) => (
              <div
                key={`${url}-dot-${index}`}
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors duration-200',
                  index === current ? 'bg-white' : 'bg-white/30',
                )}
              />
            ))}
          </div>
          <CoverNavButtons />
        </>
      ) : null}
    </Carousel>
  )
}

function CoverPlaceholder({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground">
      {isGenerating ? (
        <>
          <SparklesIcon className="size-5 animate-pulse opacity-60" strokeWidth={1.5} />
          <span className="text-[11px] tracking-tight">Generating</span>
        </>
      ) : (
        <UserRoundIcon className="size-7 opacity-30" strokeWidth={1.4} />
      )}
    </div>
  )
}

export function InfluencerCard({ influencer, onDelete }: InfluencerCardProps) {
  const href = DASHBOARD_ROUTES.STUDIO.influencer(influencer._id)
  const isGenerating = influencer.status === 'generating'
  const images = collectImages(influencer)
  const niches = influencer.niche.slice(0, 2).map(nicheLabel)
  const nicheLine = niches.join(' · ')
  const showStatusBadge = influencer.status !== 'ready'
  const metaLine = [
    nicheLine || null,
    influencer.usageCount > 0 ? `${influencer.usageCount} uses` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="group/card relative">
      <div
        className={cn(
          'group/media relative aspect-3/4 overflow-hidden rounded-xl bg-muted/30',
          'ring-1 ring-border/60 transition-[box-shadow,ring-color] duration-200 ease-out',
          'group-hover/card:ring-border group-hover/card:shadow-sm',
        )}
      >
        {images.length > 0 ? (
          <CoverCarousel images={images} name={influencer.name} href={href} />
        ) : (
          <Link href={href} className="absolute inset-0 block" aria-label={`Open ${influencer.name}`}>
            <CoverPlaceholder isGenerating={isGenerating} />
          </Link>
        )}

        {showStatusBadge ? (
          <div className="pointer-events-none absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-medium tracking-tight text-white backdrop-blur-md">
              <StatusDot status={influencer.status} />
              {STATUS_LABEL[influencer.status]}
            </span>
          </div>
        ) : null}

        {/* Soft top edge for chrome contrast */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/20 to-transparent opacity-80"
          aria-hidden
        />
      </div>

      <div className="mt-2.5 space-y-1 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={href}
            className="min-w-0 flex-1 focus-visible:underline focus-visible:outline-none"
          >
            <h2 className="truncate text-[13px] font-medium leading-snug tracking-tight text-foreground">
              {influencer.name}
            </h2>
          </Link>

          {onDelete ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className={cn(
                    'size-6 shrink-0 rounded-md text-muted-foreground opacity-0 transition-opacity duration-150',
                    'hover:bg-muted hover:text-foreground',
                    'group-hover/card:opacity-100 group-focus-within/card:opacity-100 max-sm:opacity-100',
                  )}
                  aria-label={`More actions for ${influencer.name}`}
                >
                  <MoreHorizontalIcon className="size-3.5" strokeWidth={1.75} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={event => {
                    event.preventDefault()
                    onDelete(influencer)
                  }}
                >
                  <Trash2Icon className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center gap-1.5 text-[11px] leading-none text-muted-foreground">
          {!showStatusBadge ? (
            <>
              <StatusDot status={influencer.status} />
              <span className="shrink-0">{STATUS_LABEL[influencer.status]}</span>
              {metaLine ? (
                <>
                  <span className="text-border" aria-hidden>
                    ·
                  </span>
                  <span className="truncate">{metaLine}</span>
                </>
              ) : null}
            </>
          ) : metaLine ? (
            <span className="truncate">{metaLine}</span>
          ) : (
            <span className="tabular-nums text-muted-foreground/70">
              {formatRelativeTime(influencer.updatedAt)}
            </span>
          )}
        </div>

        {influencer.bio ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/75">
            {influencer.bio}
          </p>
        ) : null}
      </div>
    </article>
  )
}
