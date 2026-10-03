'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { ChevronRight, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { HERO, LANDING_FEATURES_NAV, LANDING_HEADER, LANDING_NAV } from './content'
import { FEATURE_NAV_ICONS } from './feature-nav-icons'
import {
  landingCtaPrimary,
  landingCtaSecondary,
  landingNavLink,
} from './landing-classes'

export function MobileNav({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 min-h-11 min-w-11 rounded-full md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100vw-2rem,20rem)] border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-[color-mix(in_srgb,var(--landing-canvas)_92%,white)] backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-base">Socialista</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Primary">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="features" className="border-none">
              <AccordionTrigger
                className={cn(
                  landingNavLink,
                  'flex min-h-11 items-center rounded-md px-3 py-2 text-sm hover:no-underline [&[data-state=open]]:text-[var(--landing-ink)]',
                )}
              >
                {LANDING_HEADER.features.label}
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <ul className="flex flex-col gap-0.5 pl-1">
                  {LANDING_FEATURES_NAV.flatMap(group =>
                    group.items.map(item => {
                      const Icon = FEATURE_NAV_ICONS[item.slug]
                      return (
                        <li key={item.slug}>
                          <Link
                            href={item.href}
                            className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[var(--landing-muted)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[color-mix(in_srgb,var(--landing-stone)_22%,white)] hover:text-[var(--landing-ink)] focus-visible:ring-2 focus-visible:ring-[var(--landing-ink)]/15"
                            onClick={() => setOpen(false)}
                          >
                            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                            <span className="truncate font-medium tracking-[-0.01em]">{item.label}</span>
                          </Link>
                        </li>
                      )
                    }),
                  )}
                  <li>
                    <Link
                      href={LANDING_HEADER.features.overviewHref}
                      className="flex min-h-10 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[color-mix(in_srgb,var(--landing-stone)_22%,white)] focus-visible:ring-2 focus-visible:ring-[var(--landing-ink)]/15"
                      onClick={() => setOpen(false)}
                    >
                      {LANDING_HEADER.features.overviewLabel}
                      <ChevronRight className="size-4 opacity-60" aria-hidden />
                    </Link>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {LANDING_NAV.map(item => (
            <a
              key={item.label}
              href={item.href}
              className={`${landingNavLink} flex min-h-11 items-center rounded-md px-3 text-sm`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}

          <div className="mt-4 flex flex-col gap-2 border-t border-[color-mix(in_srgb,var(--landing-stone)_75%,transparent)] pt-4">
            {isLoggedIn ? (
              <Button asChild size="lg" className={cn(landingCtaPrimary, 'gap-1.5')}>
                <Link href={DASHBOARD_ROUTES.ROOT} onClick={() => setOpen(false)}>
                  Go to dashboard
                  <ChevronRight className="size-4 translate-y-px opacity-80" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="lg" className={landingCtaSecondary}>
                  <Link href="/auth/signin" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="lg" className={cn(landingCtaPrimary, 'gap-1.5')}>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}>
                    {HERO.primaryCta}
                    <ChevronRight className="size-4 translate-y-px opacity-80" aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
