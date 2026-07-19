import { AudienceTabs } from '@/app/(home)/_components/landing/audience-tabs'
import { BrandMarquee } from '@/app/(home)/_components/landing/brand-marquee'
import { LandingFaq } from '@/app/(home)/_components/landing/landing-faq'
import { LandingFeatures } from '@/app/(home)/_components/landing/landing-features'
import { LandingFinalCta } from '@/app/(home)/_components/landing/landing-final-cta'
import { LandingHero } from '@/app/(home)/_components/landing/landing-hero'
import { LandingShowcase } from '@/app/(home)/_components/landing/landing-showcase'
import { LandingWorkflow } from '@/app/(home)/_components/landing/landing-workflow'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { ProblemStrip } from '@/app/(home)/_components/landing/problem-strip'
import { RoadmapSection } from '@/app/(home)/_components/landing/roadmap-section'
import { SiteFooter } from '@/app/(home)/_components/landing/site-footer'
import { SiteHeader } from '@/app/(home)/_components/landing/site-header'
import { StatsBand } from '@/app/(home)/_components/landing/stats-band'
import type { Metadata } from 'next'

const title = 'Socialista — The social content studio you actually want to open'
const description =
  'Generate images and ads, design carousels, edit short video, and schedule everything from one workspace. Join the Socialista waitlist for early access.'

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'Socialista',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  alternates: {
    canonical: '/',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Socialista',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/PreOrder',
  },
}

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main>
        <LandingHero />
        <BrandMarquee />
        <StatsBand />
        <ProblemStrip />
        <LandingShowcase />
        <LandingWorkflow />
        <LandingFeatures />
        <AudienceTabs />
        <RoadmapSection />
        <LandingFaq />
        <LandingFinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
