'use client'

import { LANDING_NAV, WAITLIST_FORM_ID } from '@/app/(home)/_components/landing/content'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { MobileNav } from '@/app/(home)/_components/landing/mobile-nav'
import Logo from '@/components/common/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(styles.header, scrolled && styles.headerScrolled)}>
      <div className={`${styles.section} flex h-full items-center justify-between gap-4`}>
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LANDING_NAV.map(item => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" className="hidden h-8 px-3.5 text-sm sm:inline-flex" asChild>
            <a href={`#${WAITLIST_FORM_ID}`}>Join waitlist</a>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
