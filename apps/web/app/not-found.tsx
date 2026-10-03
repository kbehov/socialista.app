import { NotFoundStage } from '@/components/landing/not-found-stage'
import { LandingShell } from '@/components/landing/landing-shell'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
  description:
    'This page ghosted you. Head back to Socialista home or explore features and pricing.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <LandingShell>
      <SiteHeader />
      <main id="main-content" className="flex min-w-0 flex-col">
        <NotFoundStage />
      </main>
      <SiteFooter />
    </LandingShell>
  )
}
