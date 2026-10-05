'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const IMAGE_WAITING_TIPS = [
  'Attach your product as @image1 for on-brand results.',
  '4:5 frames tend to hold attention in the feed.',
  'One clear product, one job: hero, lifestyle, or offer.',
  'Hard side light reads premium. Soft window light reads real.',
  'Recreate a template when you like the layout and need your product in it.',
] as const

const VIDEO_WAITING_TIPS = [
  'Great clips take a few minutes — good motion is worth the wait.',
  '9:16 with sound on feels native to Reels and TikTok.',
  'Attach your product as @image1 to keep every frame on-brand.',
  'Auto duration lets the model choose the pacing.',
  'Recreate a template when you like the motion and need your product in it.',
] as const

type GenerationWaitingTipsProps = {
  kind?: 'image' | 'video'
}

export function GenerationWaitingTips({ kind = 'image' }: GenerationWaitingTipsProps) {
  const tips = kind === 'video' ? VIDEO_WAITING_TIPS : IMAGE_WAITING_TIPS
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let fadeTimer = 0
    const interval = window.setInterval(() => {
      setVisible(false)
      fadeTimer = window.setTimeout(() => {
        setIndex(current => (current + 1) % tips.length)
        setVisible(true)
      }, 180)
    }, 6000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(fadeTimer)
    }
  }, [kind, reducedMotion, tips])

  const tip = tips[index] ?? tips[0]

  return (
    <div className="mx-auto max-w-md text-center">
      <p className="text-[11px] font-medium tracking-[-0.01em] text-black/40 dark:text-white/40">While you wait</p>
      <p
        className={cn(
          'mt-1.5 text-[13px] leading-[1.5] tracking-[-0.01em] text-black/64 dark:text-white/64',
          'transition-opacity duration-200 ease-out motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {tip}
      </p>
    </div>
  )
}
