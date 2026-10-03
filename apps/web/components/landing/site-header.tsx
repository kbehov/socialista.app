'use client'

import Logo from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { HERO, LANDING_NAV, SIGNUP_HREF } from './content'
import { landingCtaPrimaryCompact, landingCtaSecondary, landingNavLink, landingSection } from './landing-classes'
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
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-[background-color] duration-200 ease-out',
        scrolled
          ? 'bg-[color-mix(in_srgb,var(--landing-canvas)_94%,white)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--landing-canvas)_55%,transparent)]'
          : 'bg-(--landing-canvas)',
      )}
    >
      <div
        className={cn(
          landingSection,
          'grid h-14 min-h-14 grid-cols-[1fr_auto] items-center gap-3 sm:h-[3.75rem] sm:min-h-[3.75rem] sm:gap-4',
          'md:grid-cols-[1fr_auto_1fr]',
        )}
      >
        <div className="flex min-w-0 items-center">
          <Logo variant="landing" />
        </div>

        <nav
          aria-label="Primary"
          className="hidden items-center justify-center gap-7 md:flex lg:gap-8 md:col-start-2 md:row-start-1"
        >
          {LANDING_NAV.map(item => (
            <a key={item.label} href={item.href} className={cn(landingNavLink, 'text-sm')}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="col-start-2 flex shrink-0 items-center justify-end gap-2 sm:gap-2.5 md:col-start-3">
          {isLoggedIn ? (
            <Button asChild size="lg" className={cn(landingCtaPrimaryCompact, 'hidden md:inline-flex')}>
              <Link href={DASHBOARD_ROUTES.ROOT}>
                Go to dashboard
                <ChevronRight className="size-4 translate-y-px opacity-80" aria-hidden="true" />
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
                <Link href={SIGNUP_HREF}>
                  {HERO.compactCta}
                  <ChevronRight className="size-4 translate-y-px opacity-80" aria-hidden="true" />
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
