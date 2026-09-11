'use client'

import Logo from '@/components/common/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { LANDING_NAV } from './content'
import styles from './landing.module.css'
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
    <header className={cn(styles.header, scrolled && styles.headerScrolled)}>
      <div className={`${styles.section} ${styles.headerInner}`}>
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LANDING_NAV.map(item => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" className="hidden h-8 px-3.5 text-sm sm:inline-flex" asChild>
            <Link href="/auth/signup">Start free</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
