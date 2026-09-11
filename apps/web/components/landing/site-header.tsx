'use client'

import Logo from '@/components/common/logo'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

import { LANDING_NAV } from './content'
import { landingNavLink, landingSection } from './landing-classes'
import { MobileNav } from './mobile-nav'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
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
        'sticky top-0 z-40 h-16 border-b border-transparent bg-[color-mix(in_oklch,var(--background)_82%,transparent)] backdrop-blur-[12px] backdrop-saturate-[140%] transition-[border-color,background-color] duration-[180ms] ease-out',
        scrolled && 'border-border bg-[color-mix(in_oklch,var(--background)_92%,transparent)]',
      )}
    >
      <div className={`${landingSection} grid h-full grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]`}>
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LANDING_NAV.map(item => (
            <a key={item.href} href={item.href} className={landingNavLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <ShimmerButton
            href="/auth/signin"
            borderRadius="9999px"
            className="hidden h-9 px-5 py-0 text-sm font-semibold sm:inline-flex"
          >
            Login or Signup
          </ShimmerButton>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
