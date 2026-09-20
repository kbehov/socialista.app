'use client'

import Image from 'next/image'
import { useReducedMotion } from 'motion/react'

import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'

import { STATIC_AD_MARQUEE_IMAGES } from './media'

const IMAGE_QUALITY = 88

const ROWS = [
  { reverse: false, durationClass: '[--duration:52s]', offset: 0 },
  { reverse: true, durationClass: '[--duration:68s]', offset: 3 },
  { reverse: false, durationClass: '[--duration:58s]', offset: 6 },
] as const

function rotateImages(offset: number) {
  const images = STATIC_AD_MARQUEE_IMAGES
  const len = images.length
  if (len === 0) return []
  const start = offset % len
  return [...images.slice(start), ...images.slice(0, start)]
}

function AdTile({ src }: { src: string }) {
  return (
    <div className="relative h-[11.25rem] w-[9rem] shrink-0 overflow-hidden rounded-[1.15rem] bg-black/50 shadow-[0_14px_32px_-20px_rgb(0_0_0/0.7)] outline outline-1 outline-white/10 sm:h-[13.5rem] sm:w-[10.8rem]">
      <Image
        src={src}
        alt=""
        fill
        quality={IMAGE_QUALITY}
        sizes="(max-width: 640px) 144px, 173px"
        className="object-cover"
      />
    </div>
  )
}

function MarqueeRow({
  reverse,
  durationClass,
  offset,
  staticRow,
}: {
  reverse: boolean
  durationClass: string
  offset: number
  staticRow: boolean
}) {
  const tiles = rotateImages(offset).map((src, index) => (
    <AdTile key={`${offset}-${src}-${index}`} src={src} />
  ))

  if (staticRow) {
    return <div className="flex justify-center gap-2.5 overflow-hidden sm:gap-3">{tiles}</div>
  }

  return (
    <Marquee
      reverse={reverse}
      repeat={2}
      className={cn('w-full p-0 [--gap:0.65rem] sm:[--gap:0.8rem]', durationClass)}
    >
      {tiles}
    </Marquee>
  )
}

export function StaticAdsMarquee() {
  const reduceMotion = useReducedMotion()
  const staticRow = Boolean(reduceMotion)

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center gap-2.5 overflow-hidden py-3 sm:gap-3"
      aria-hidden="true"
    >
      {ROWS.map(row => (
        <MarqueeRow
          key={row.durationClass}
          reverse={row.reverse}
          durationClass={row.durationClass}
          offset={row.offset}
          staticRow={staticRow}
        />
      ))}
    </div>
  )
}
