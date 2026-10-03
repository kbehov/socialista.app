'use client'

import { Heart, Play } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

import { SLIDESHOW_MARQUEE_ITEMS } from './media'
import { landingMediaCardHover } from './landing-classes'

type SlideshowItem = (typeof SLIDESHOW_MARQUEE_ITEMS)[number]

const itemsById = Object.fromEntries(SLIDESHOW_MARQUEE_ITEMS.map(item => [item.id, item])) as Record<
  SlideshowItem['id'],
  SlideshowItem
>

const SHOWCASE_ROW: {
  key: string
  id: SlideshowItem['id']
  rotate: number
  featured?: boolean
}[] = [
  { key: 'theories', id: 'theories', rotate: -4 },
  { key: 'budget', id: 'budget', rotate: -1.5, featured: true },
  { key: 'skincare', id: 'skincare', rotate: 1.5 },
  { key: 'morning', id: 'morning', rotate: 4 },
]

const cardWidth = 'w-[5.75rem] sm:w-[7rem] md:w-[7.75rem] lg:w-[8.5rem]'
const cardWidthFeatured = 'w-[7.25rem] sm:w-[8.75rem] md:w-[9.75rem] lg:w-[10.75rem]'

const cardWidthCompact = 'w-[6.25rem] sm:w-[7.5rem] md:w-[8.25rem] lg:w-[9.25rem] xl:w-[10rem]'
const cardWidthFeaturedCompact = 'w-[7.25rem] sm:w-[8.75rem] md:w-[9.5rem] lg:w-[10.75rem] xl:w-[11.5rem]'

function SlideshowPreviewCard({
  item,
  className,
  featured = false,
  compact = false,
}: {
  item: SlideshowItem
  className?: string
  featured?: boolean
  compact?: boolean
}) {
  const focal = item.focal ?? '50% 38%'

  return (
    <article
      className={cn(
        'relative aspect-9/16 shrink-0 overflow-hidden rounded-[var(--landing-media-radius)] bg-[var(--landing-media-raised)] shadow-[0_10px_24px_-16px_rgb(0_0_0/0.45),0_0_0_1px_rgb(255_255_255/0.1)]',
        landingMediaCardHover,
        compact
          ? featured
            ? cardWidthFeaturedCompact
            : cardWidthCompact
          : featured
            ? cardWidthFeatured
            : cardWidth,
        className,
      )}
    >
      <Image
        src={item.src}
        alt=""
        fill
        quality={80}
        sizes={featured ? '(max-width: 640px) 128px, 192px' : '(max-width: 640px) 112px, 168px'}
        className="object-cover"
        style={{ objectPosition: focal }}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/75 via-black/25 to-transparent px-1.5 pb-1.5 pt-3 sm:px-2 sm:pb-2 sm:pt-4',
          compact && 'pt-2.5 sm:pt-3',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-0.5 font-semibold leading-none text-white/95 tabular-nums',
            compact
              ? 'text-[0.625rem] sm:text-sidebar-label'
              : featured
                ? 'text-sidebar-label sm:text-[0.75rem]'
                : 'text-[0.625rem] sm:text-sidebar-label',
          )}
        >
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Play
              className={cn('shrink-0 fill-white', compact ? 'size-2 sm:size-2.5' : 'size-2.5 sm:size-3')}
              strokeWidth={0}
              aria-hidden="true"
            />
            {item.views}
          </span>
          <span className="flex items-center gap-0.5 text-white/88 sm:gap-1">
            <Heart
              className={cn('shrink-0 fill-white/88', compact ? 'size-2 sm:size-2.5' : 'size-2.5 sm:size-3')}
              strokeWidth={0}
              aria-hidden="true"
            />
            {item.likes}
          </span>
        </div>
      </div>
    </article>
  )
}

const ENTER_EASE = [0.22, 1, 0.36, 1] as const

function ShowcaseCard({
  itemId,
  rotate,
  featured = false,
  enterDelay = 0,
  compact = false,
}: {
  itemId: SlideshowItem['id']
  rotate: number
  featured?: boolean
  enterDelay?: number
  compact?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const item = itemsById[itemId]

  return (
    <motion.div
      className={cn(
        'shrink-0 overflow-visible',
        compact ? 'p-1 sm:p-1.5' : 'p-2 sm:p-2.5',
        featured && (compact ? '-translate-y-0.5' : '-translate-y-1 sm:-translate-y-2'),
      )}
      style={{ rotate: `${rotate}deg` }}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        ease: ENTER_EASE,
        delay: enterDelay,
      }}
    >
      <SlideshowPreviewCard item={item} featured={featured} compact={compact} />
    </motion.div>
  )
}

export function SlideshowShowcase({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative -mx-5 overflow-visible sm:-mx-6 lg:-mx-8">
      {/* Decorative row: outer cards peek and fade on narrow screens instead of scrolling */}
      <div
        className={cn(
          'overflow-hidden px-5 lg:overflow-visible lg:px-10 xl:px-12',
          '[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] lg:[mask-image:none]',
          compact ? 'py-2 sm:py-3' : 'py-4 sm:py-5',
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            'relative left-1/2 flex w-max max-w-none -translate-x-1/2 items-end justify-center',
            compact
              ? 'gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3'
              : 'gap-2 sm:gap-3 md:gap-4 lg:gap-[1.125rem] xl:gap-5',
          )}
        >
        {SHOWCASE_ROW.map((entry, index) => (
          <ShowcaseCard
            key={entry.key}
            itemId={entry.id}
            rotate={entry.rotate}
            featured={entry.featured}
            enterDelay={index * 0.05}
            compact={compact}
          />
        ))}
        </div>
      </div>
    </div>
  )
}
