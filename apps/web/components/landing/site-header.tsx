'use client'

import Logo from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { HERO, LANDING_NAV } from './content'
import { landingCtaPrimaryCompact, landingCtaSecondary, landingNavLink } from './landing-classes'
import { MobileNav } from './mobile-nav'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = useSession()
  const isLoggedIn = Boolean(session?.user)

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
          'flex w-fit max-w-[calc(100vw-2rem)] items-center gap-4 rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_78%,white)] px-4 py-2 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.72),0_1px_2px_color-mix(in_oklch,var(--landing-ink)_4%,transparent),0_10px_28px_-14px_color-mix(in_oklch,var(--landing-ink)_10%,transparent)] backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow,border-color] duration-200 ease-out supports-backdrop-filter:bg-[color-mix(in_srgb,var(--landing-canvas)_68%,white)] sm:gap-6 sm:px-5 sm:py-2.5',
          scrolled &&
            'border-[color-mix(in_srgb,var(--landing-ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_88%,white)] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.8),0_2px_4px_color-mix(in_oklch,var(--landing-ink)_5%,transparent),0_14px_36px_-16px_color-mix(in_oklch,var(--landing-ink)_14%,transparent)] supports-backdrop-filter:bg-[color-mix(in_srgb,var(--landing-canvas)_72%,white)]',
        )}
      >
        <Logo variant="landing" className="pl-0.5 sm:pl-1" />

        <nav aria-label="Primary" className="hidden items-center gap-7 px-1.5 md:flex lg:gap-8">
          {LANDING_NAV.map(item => (
            <a key={item.label} href={item.href} className={cn(landingNavLink, 'text-sm')}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 pl-1.5 sm:pl-2">
          {isLoggedIn ? (
            <Button asChild size="lg" className={cn(landingCtaPrimaryCompact, 'hidden md:inline-flex')}>
              <Link href={DASHBOARD_ROUTES.ROOT}>
                Go to dashboard
                <ChevronRight className="size-4 opacity-80" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                size="lg"
                className={cn(landingCtaSecondary, 'hidden h-10 px-5 text-sm md:inline-flex')}
              >
                <Link href="/auth/signin">Sign in</Link>
              </Button>
              <Button asChild size="lg" className={cn(landingCtaPrimaryCompact, 'hidden md:inline-flex')}>
                <Link href="/auth/signup">
                  {HERO.primaryCta}
                  <ChevronRight className="size-4 opacity-80" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  )
}
