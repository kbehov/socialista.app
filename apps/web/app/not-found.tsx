import { LandingShell } from '@/components/landing/landing-shell'
import {
  landingCtaPrimary,
  landingCtaSecondary,
  landingCtaStack,
  landingEyebrow,
  landingSection,
  landingSectionLead,
  landingSectionTitle,
  landingSectionY,
} from '@/components/landing/landing-classes'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page does not exist. Head back to Socialista home, features, or pricing.',
  robots: { index: false, follow: true },
}

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
] as const

export default function NotFound() {
  return (
    <LandingShell>
      <SiteHeader />
      <main id="main-content" className="flex min-w-0 flex-col">
        <section aria-labelledby="not-found-heading" className={cn(landingSection, landingSectionY)}>
          <div className="mx-auto max-w-xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>404</p>
            <h1 id="not-found-heading" className={landingSectionTitle}>
              This page is gone
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>
              The URL may have moved, or it never existed. Try home, a feature guide, or pricing.
            </p>
            <div className={cn(landingCtaStack, 'mt-8 items-center sm:mt-10')}>
              {LINKS.map((link, index) => (
                <Button
                  key={link.href}
                  asChild
                  size="lg"
                  className={index === 0 ? landingCtaPrimary : landingCtaSecondary}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </LandingShell>
  )
}
