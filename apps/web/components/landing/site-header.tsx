'use client'

import Logo from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { HERO, LANDING_NAV } from './content'
import { landingCtaSecondary, landingNavLink } from './landing-classes'
import { MobileNav } from './mobile-nav'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '')
      if (!id) return
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }

    scrollToHash()
    const timer = window.setTimeout(scrollToHash, 80)
    window.addEventListener('hashchange', scrollToHash)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 flex justify-center px-4 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          'flex w-fit max-w-[calc(100vw-2rem)] items-center gap-4 rounded-full border border-[color-mix(in_srgb,var(--landing-stone)_78%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_82%,white)] px-4 py-2 shadow-[0_1px_2px_color-mix(in_oklch,var(--landing-ink)_5%,transparent),0_8px_24px_-12px_color-mix(in_oklch,var(--landing-ink)_10%,transparent)] backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow,border-color] duration-200 ease-out supports-backdrop-filter:bg-[color-mix(in_srgb,var(--landing-canvas)_76%,white)] sm:gap-6 sm:px-5 sm:py-2.5',
          scrolled &&
            'border-[color-mix(in_srgb,var(--landing-stone)_92%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_94%,white)] shadow-[0_2px_4px_color-mix(in_oklch,var(--landing-ink)_6%,transparent),0_12px_32px_-16px_color-mix(in_oklch,var(--landing-ink)_14%,transparent)] supports-backdrop-filter:bg-[color-mix(in_srgb,var(--landing-canvas)_88%,white)]',
        )}
      >
        <Logo size="default" className="pl-1 sm:pl-1.5" />

        <nav aria-label="Primary" className="hidden items-center gap-7 px-1.5 md:flex lg:gap-8">
          {LANDING_NAV.map(item => (
            <a key={item.label} href={item.href} className={cn(landingNavLink, 'text-sm')}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 pl-1.5 sm:pl-2">
          <Button
            asChild
            variant="outline"
            size="lg"
            className={cn(landingCtaSecondary, 'hidden h-10 px-5 text-sm md:inline-flex')}
          >
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <ShimmerButton href="/auth/signup" className="hidden h-10 px-6 text-sm md:inline-flex">
            {HERO.primaryCta}
            <ChevronRight className="size-4 opacity-80" aria-hidden="true" />
          </ShimmerButton>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
