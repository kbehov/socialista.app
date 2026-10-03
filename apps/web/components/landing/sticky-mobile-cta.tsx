'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { HERO, SIGNUP_HREF } from './content'
import { landingCtaPrimaryLg } from './landing-classes'
import { useLandingCtaHref } from './section-cta'

/**
 * Mobile-only bottom CTA: shows once the hero headline scrolls away,
 * hides again when the final CTA band is on screen.
 */
export function StickyMobileCta() {
  const href = useLandingCtaHref()
  const [heroVisible, setHeroVisible] = useState(true)
  const [finalVisible, setFinalVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero-heading')
    const final = document.getElementById('get-started')
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting)
        if (entry.target === final) setFinalVisible(entry.isIntersecting)
      }
    })
    if (hero) observer.observe(hero)
    if (final) observer.observe(final)
    return () => observer.disconnect()
  }, [])

  const visible = !heroVisible && !finalVisible

  return (
    <div
      className={cn(
        'landing-sticky-cta fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:hidden',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
      )}
      aria-hidden={!visible}
    >
      <Button
        asChild
        size="lg"
        className={cn(
          landingCtaPrimaryLg,
          'group w-full shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]',
        )}
      >
        <Link href={href} tabIndex={visible ? undefined : -1}>
          {href === SIGNUP_HREF ? HERO.primaryCta : 'Go to dashboard'}
          <ArrowRight className="size-4 translate-y-px opacity-80" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
