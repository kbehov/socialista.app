'use client'

import { FadeIn, Stagger, StaggerItem } from '@/components/landing/fade-in'
import {
  landingCtaPrimaryLg,
  landingCtaStack,
  landingEyebrow,
  landingHeroTitleAccent,
  landingSectionLead,
  landingSectionTitle,
} from '@/components/landing/landing-classes'
import { WordRotate } from '@/components/ui/word-rotate'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, Ghost } from 'lucide-react'
import Link from 'next/link'

const EXCUSES = [
  'Shadowbanned by the internet',
  'Stuck in draft forever',
  'Lost in the algorithm',
  'Never made it past review',
] as const

const QUICK_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
] as const

export function NotFoundStage() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="relative flex flex-1 flex-col justify-center overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[12%] h-[min(28rem,52vh)] bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,color-mix(in_oklch,var(--accent-orange)_7%,transparent),transparent_72%),radial-gradient(ellipse_55%_45%_at_50%_58%,color-mix(in_oklch,var(--landing-ink)_4%,transparent),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-3xl px-5 text-center sm:px-6 lg:px-8">
        <Stagger className="flex flex-col items-center" delay={0.05} stagger={0.08} immediate>
          <StaggerItem>
            <p className={cn(landingEyebrow, 'mb-3 inline-flex items-center gap-2')}>
              <Ghost className="size-3.5 opacity-80" strokeWidth={2} aria-hidden />
              Error 404
            </p>
          </StaggerItem>

          <StaggerItem className="relative w-full">
            <p
              aria-hidden
              className="pointer-events-none select-none text-[clamp(5.5rem,22vw,9.5rem)] font-semibold leading-none tracking-[-0.06em] text-[color-mix(in_oklch,var(--landing-ink)_6%,transparent)]"
            >
              404
            </p>
            <h1
              id="not-found-heading"
              className={cn(landingSectionTitle, '-mt-[0.35em] text-[clamp(1.75rem,5vw,2.75rem)]')}
            >
              This page{' '}
              <span className={landingHeroTitleAccent}>ghosted</span> you
            </h1>
          </StaggerItem>

          <StaggerItem className="mt-4 w-full max-w-xl sm:mt-5">
            <p className={landingSectionLead}>
              We looked everywhere—home feed, drafts, and that one folder named &ldquo;final_final_v2.&rdquo;
              Nothing here.
            </p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-[var(--landing-muted)] sm:text-[0.9375rem]">
              Official diagnosis:{' '}
              <WordRotate
                words={[...EXCUSES]}
                duration={2800}
                wrapperClassName="inline-flex align-baseline py-0"
                className="font-medium text-[var(--landing-ink)]"
                motionProps={{
                  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
                  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  exit: { opacity: 0, y: -6, filter: 'blur(4px)' },
                  transition: { type: 'spring', duration: 0.3, bounce: 0 },
                }}
              />
            </p>
          </StaggerItem>

          <StaggerItem className="mt-8 w-full sm:mt-10">
            <div className={cn(landingCtaStack, 'items-center')}>
              <Button asChild size="lg" className={landingCtaPrimaryLg}>
                <Link href="/">
                  <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
                  Back to home
                </Link>
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem className="mt-6">
            <nav aria-label="Helpful links">
              <ul className="flex flex-wrap items-center justify-center gap-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex h-9 items-center rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-[color-mix(in_srgb,white_55%,var(--landing-canvas))] px-4 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-muted)] outline-none transition-[color,background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-[color-mix(in_srgb,var(--landing-ink)_12%,transparent)] hover:text-[var(--landing-ink)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--landing-ink)] active:scale-[0.96] motion-reduce:active:scale-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </StaggerItem>
        </Stagger>

        <FadeIn className="mt-10 text-[0.75rem] text-[var(--landing-muted)]" delay={0.35} immediate>
          Pro tip: if you typed the URL by hand, blame autocorrect. We do.
        </FadeIn>
      </div>
    </section>
  )
}
