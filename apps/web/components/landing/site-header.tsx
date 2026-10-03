'use client'

import Logo from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { HERO, LANDING_HEADER, SIGNUP_HREF } from './content'
import { FeaturesMegaMenuContent, featuresMegaMenuPanelClass } from './features-mega-menu'
import { landingCtaPrimaryCompact, landingCtaSecondary, landingSection } from './landing-classes'
import { MobileNav } from './mobile-nav'

const headerNavTextClass =
  'text-sm font-medium tracking-[-0.01em] text-foreground transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-foreground/80'

const headerNavItemClass = cn(
  headerNavTextClass,
  'inline-flex h-9 w-max items-center bg-transparent px-0 py-0 shadow-none outline-none hover:bg-transparent focus:bg-transparent focus-visible:ring-2 focus-visible:ring-ring/40 data-active:bg-transparent data-active:hover:bg-transparent',
)

const headerMenuTriggerClass = cn(
  navigationMenuTriggerStyle(),
  headerNavItemClass,
  'gap-0.5 data-popup-open:bg-transparent data-open:bg-transparent',
)

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
        'sticky top-0 z-40 w-full overflow-visible transition-[background-color] duration-200 ease-out',
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

        <NavigationMenu
          viewport={false}
          className="z-50 hidden max-w-max flex-none md:flex md:col-start-2 md:row-start-1"
        >
          <NavigationMenuList className="gap-7 lg:gap-8">
            <NavigationMenuItem>
              <NavigationMenuTrigger className={headerMenuTriggerClass}>
                {LANDING_HEADER.features.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent
                className={cn(
                  featuresMegaMenuPanelClass,
                  'absolute top-full left-1/2 z-50 mt-2.5 -translate-x-1/2 p-0',
                  '!left-1/2 !top-full !w-[min(56rem,calc(100vw-2rem))] !max-w-[calc(100vw-2rem)]',
                  'data-[motion=from-end]:slide-in-from-right-0 data-[motion=from-start]:slide-in-from-left-0 data-[motion=to-end]:slide-out-to-right-0 data-[motion=to-start]:slide-out-to-left-0 data-[motion^=from-]:fade-in-0 data-[motion^=to-]:fade-out-0',
                )}
              >
                <FeaturesMegaMenuContent />
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={headerNavItemClass}>
                <Link href={LANDING_HEADER.pricing.href}>{LANDING_HEADER.pricing.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={headerNavItemClass}>
                <Link href={LANDING_HEADER.about.href}>{LANDING_HEADER.about.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

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
