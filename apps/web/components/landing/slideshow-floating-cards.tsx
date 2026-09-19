'use client'

import { Heart, Play } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

import { SLIDESHOW_MARQUEE_ITEMS } from './media'

type SlideshowItem = (typeof SLIDESHOW_MARQUEE_ITEMS)[number]

const itemsById = Object.fromEntries(SLIDESHOW_MARQUEE_ITEMS.map(item => [item.id, item])) as Record<
  SlideshowItem['id'],
  SlideshowItem
>

const SHOWCASE_ROW: {
  id: SlideshowItem['id']
  rotate: number
  featured?: boolean
}[] = [
  { id: 'theories', rotate: -3 },
  { id: 'budget', rotate: -1, featured: true },
  { id: 'skincare', rotate: 1 },
  { id: 'morning', rotate: 3 },
]

const cardWidth = 'w-[5.75rem] sm:w-[7rem] md:w-[7.75rem] lg:w-[8.5rem]'
const cardWidthFeatured = 'w-[7.25rem] sm:w-[8.75rem] md:w-[9.75rem] lg:w-[10.75rem]'

function SlideshowPreviewCard({
  item,
  className,
  featured = false,
  priority,
}: {
  item: SlideshowItem
  className?: string
  featured?: boolean
  priority?: boolean
}) {
  const focal = item.focal ?? '50% 38%'

  return (
    <article
      className={cn(
        'relative aspect-9/16 shrink-0 overflow-hidden rounded-[0.95rem] bg-[#121212] shadow-[0_14px_32px_-18px_rgb(0_0_0/0.38),0_0_0_1px_rgb(255_255_255/0.1)] sm:rounded-[1.05rem]',
        featured ? cardWidthFeatured : cardWidth,
        className,
      )}
    >
      <Image
        src={item.src}
        alt=""
        fill
        unoptimized
        priority={priority}
        className="object-cover"
        style={{ objectPosition: focal }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/75 via-black/25 to-transparent px-2 pb-2 pt-5 sm:pb-2.5">
        <div
          className={cn(
            'flex flex-col gap-1 font-semibold leading-none text-white/95 tabular-nums',
            featured ? 'text-sidebar-label sm:text-[0.75rem]' : 'text-[0.625rem] sm:text-sidebar-label',
          )}
        >
          <span className="flex items-center gap-1">
            <Play className="size-2.5 shrink-0 fill-white sm:size-3" strokeWidth={0} aria-hidden="true" />
            {item.views}
          </span>
          <span className="flex items-center gap-1 text-white/88">
            <Heart className="size-2.5 shrink-0 fill-white/88 sm:size-3" strokeWidth={0} aria-hidden="true" />
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
  priority,
}: {
  itemId: SlideshowItem['id']
  rotate: number
  featured?: boolean
  enterDelay?: number
  priority?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const item = itemsById[itemId]

  return (
    <motion.div
      className={cn('shrink-0 overflow-visible', featured && '-translate-y-1 sm:-translate-y-2')}
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
      <SlideshowPreviewCard item={item} featured={featured} priority={priority} />
    </motion.div>
  )
}

export function SlideshowShowcase() {
  return (
    <div className="overflow-visible px-6 sm:px-10 md:px-14 lg:px-16">
      <div
        className="flex items-end justify-center gap-3 overflow-x-auto overflow-y-visible py-3 [-ms-overflow-style:none] scrollbar-none sm:gap-4 md:gap-5 lg:gap-6 [&::-webkit-scrollbar]:hidden"
        aria-hidden="true"
      >
        {SHOWCASE_ROW.map((entry, index) => (
          <ShowcaseCard
            key={entry.id}
            itemId={entry.id}
            rotate={entry.rotate}
            featured={entry.featured}
            enterDelay={index * 0.05}
            priority={Boolean(entry.featured)}
          />
        ))}
      </div>
    </div>
  )
}
