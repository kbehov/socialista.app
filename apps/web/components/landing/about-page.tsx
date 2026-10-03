import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { ABOUT_PAGE } from './about-content'
import { AboutSectionNav } from './about-section-nav'
import { FadeIn } from './fade-in'
import { LandingFinalCta } from './landing-final-cta'
import {
  landingBodySm,
  landingEyebrow,
  landingFocusRing,
  landingH3,
  landingSection,
  landingSectionLead,
  landingSectionTitle,
  landingSectionTitleAccentSerif,
  landingSectionY,
} from './landing-classes'
import { Section } from './section'

const prose =
  'text-pretty text-[1.0625rem] leading-[1.75] text-[color-mix(in_srgb,var(--landing-ink)_78%,white)]'

const rule = 'border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]'

const guideLink = cn(
  landingFocusRing,
  'group/link mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium tracking-[-0.01em] text-[var(--landing-ink)]',
)

const sectionTitle = cn(landingSectionTitle, 'text-[clamp(2rem,4vw,3rem)]')

function TitleAccent({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return (
    <span
      className={cn(
        landingSectionTitleAccentSerif,
        onDark && 'text-[color-mix(in_srgb,var(--landing-canvas)_92%,white)]',
      )}
    >
      {children}
    </span>
  )
}

function GuideLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={guideLink}>
      <span className="underline decoration-transparent underline-offset-[0.18em] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover/link:decoration-[color-mix(in_srgb,var(--landing-ink)_35%,transparent)]">
        {children}
      </span>
      <ArrowUpRight
        className="relative top-px size-3.5 opacity-70 transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover/link:translate-x-0.5"
        strokeWidth={2}
        aria-hidden="true"
      />
    </Link>
  )
}

export function AboutPage() {
  const { hero, facts, statement, about, does, who, day, beliefs, contact } = ABOUT_PAGE

  return (
    <>
      <Section labelledBy="about-page-heading" className="pb-14 sm:pb-16 lg:pb-20">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{hero.eyebrow}</p>
            <h1 id="about-page-heading" className={landingSectionTitle}>
              {hero.title} <TitleAccent>{hero.titleAccent}</TitleAccent>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{hero.description}</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.06} className="mt-14 sm:mt-16">
          <dl className={cn('grid border-t md:grid-cols-3', rule)}>
            {facts.map(fact => (
              <div key={fact.label} className={cn('border-b py-6 md:border-b-0 md:border-r md:px-8 md:py-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0', rule)}>
                <dt className={landingEyebrow}>{fact.label}</dt>
                <dd className={cn(landingBodySm, 'mt-3 max-w-xs text-[var(--landing-muted)] md:max-w-none')}>
                  {fact.body}
                </dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </Section>

      <div>
      <div
        className={cn(
          'sticky top-14 z-30 border-b bg-[color-mix(in_srgb,var(--landing-canvas)_94%,white)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--landing-canvas)_82%,transparent)] sm:top-[3.75rem]',
          rule,
        )}
      >
        <div className={cn(landingSection, 'py-3')}>
          <AboutSectionNav />
        </div>
      </div>

      <section aria-label="Socialista in one line">
        <div className={cn(landingSection, 'py-16 sm:py-20 lg:py-24')}>
          <FadeIn>
            <p className="mx-auto max-w-4xl text-balance text-center text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-[var(--landing-ink)]">
              {statement.lead}{' '}
              <span className="font-serif text-[1.02em] font-normal italic tracking-[-0.02em]">
                {statement.rest}
              </span>
            </p>
          </FadeIn>
        </div>
      </section>

      <Section id={about.id} landingDivider labelledBy="about-heading" className="scroll-mt-36">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:gap-20">
          <FadeIn>
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{about.eyebrow}</p>
            <h2 id="about-heading" className={sectionTitle}>
              {about.title} <TitleAccent>{about.titleAccent}</TitleAccent>
            </h2>
            <div className="mt-6 max-w-[40rem] space-y-5 sm:mt-8">
              {about.paragraphs.map(paragraph => (
                <p key={paragraph} className={prose}>
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.08} className="lg:sticky lg:top-36">
            <figure className="border-t border-[var(--landing-orange)] pt-6">
              <blockquote className="font-serif text-[clamp(1.75rem,2.6vw,2.375rem)] font-normal italic leading-[1.2] tracking-[-0.03em] text-balance text-[var(--landing-ink)]">
                {about.pull}
              </blockquote>
            </figure>
          </FadeIn>
        </div>
      </Section>

      <Section id={does.id} landingDivider labelledBy="does-heading" className="scroll-mt-36">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{does.eyebrow}</p>
            <h2 id="does-heading" className={sectionTitle}>
              {does.title} <TitleAccent>{does.titleAccent}</TitleAccent>
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{does.description}</p>
          </div>
        </FadeIn>
        <ol className={cn('mx-auto mt-12 max-w-5xl border-t sm:mt-16', rule)}>
          {does.items.map(item => (
            <li key={item.step} className={cn('border-b', rule)}>
              <FadeIn>
                <div className="grid gap-3 py-8 sm:grid-cols-[4.25rem_minmax(0,16rem)_minmax(0,1fr)] sm:items-start sm:gap-x-8 sm:py-10 lg:grid-cols-[4.5rem_minmax(0,18rem)_minmax(0,1fr)]">
                  <span className={cn(landingEyebrow, 'pt-1 tabular-nums')}>{item.step}</span>
                  <h3 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.03em] text-[var(--landing-ink)] sm:text-[1.375rem]">
                    {item.title}
                  </h3>
                  <div>
                    <p className={prose}>{item.description}</p>
                    <div className="flex flex-wrap gap-x-6">
                      <GuideLink href={item.href}>{item.link}</GuideLink>
                      {'also' in item ? <GuideLink href={item.also.href}>{item.also.link}</GuideLink> : null}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id={who.id}
        landingDivider
        labelledBy="who-heading"
        className="scroll-mt-36 bg-[var(--landing-surface-muted)]"
      >
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          <FadeIn className="lg:sticky lg:top-36">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{who.eyebrow}</p>
            <h2 id="who-heading" className={sectionTitle}>
              {who.title} <TitleAccent>{who.titleAccent}</TitleAccent>
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 text-left sm:mt-5')}>{who.description}</p>
          </FadeIn>
          <ol className={cn('border-t', rule)}>
            {who.audiences.map((audience, index) => (
              <li key={audience.title} className={cn('border-b', rule)}>
                <FadeIn>
                  <div className="grid gap-3 py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-6 sm:py-8">
                    <span className={cn(landingEyebrow, 'pt-1.5 tabular-nums')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className={cn(landingH3, 'text-[1.25rem] text-[var(--landing-ink)]')}>{audience.title}</h3>
                      <p className={cn(prose, 'mt-2')}>{audience.description}</p>
                      <div className="flex flex-wrap gap-x-6">
                        <GuideLink href={audience.href}>{audience.link}</GuideLink>
                        {'also' in audience ? (
                          <GuideLink href={audience.also.href}>{audience.also.link}</GuideLink>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section id={day.id} landingDivider labelledBy="day-heading" className="scroll-mt-36">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          <FadeIn className="lg:sticky lg:top-36">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{day.eyebrow}</p>
            <h2 id="day-heading" className={sectionTitle}>
              {day.title} <TitleAccent>{day.titleAccent}</TitleAccent>
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 text-left sm:mt-5')}>{day.description}</p>
          </FadeIn>
          <ol>
            {day.moments.map((moment, index) => {
              const last = index === day.moments.length - 1
              return (
                <li key={moment.time} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-5 sm:gap-7">
                  <div className="relative flex justify-center" aria-hidden="true">
                    {last ? null : (
                      <span
                        className={cn(
                          'absolute top-3 bottom-0 left-1/2 w-px -translate-x-1/2',
                          'bg-[color-mix(in_srgb,var(--landing-ink)_12%,transparent)]',
                        )}
                      />
                    )}
                    <span className="relative z-10 mt-1.5 size-2 shrink-0 rounded-full bg-[var(--landing-ink)] ring-4 ring-[var(--landing-canvas)]" />
                  </div>
                  <FadeIn className={cn(!last && 'pb-10 sm:pb-12')}>
                    <p className={landingEyebrow}>
                      <span className="tabular-nums">{moment.time}</span>
                      <span className="px-2 text-[color-mix(in_srgb,var(--landing-ink)_20%,transparent)]" aria-hidden="true">
                        ·
                      </span>
                      {moment.label}
                    </p>
                    <h3 className="mt-3 text-[1.25rem] font-semibold leading-snug tracking-[-0.03em] text-[var(--landing-ink)] sm:text-[1.375rem]">
                      {moment.title}
                    </h3>
                    <p className={cn(prose, 'mt-2 max-w-[36rem]')}>{moment.body}</p>
                  </FadeIn>
                </li>
              )
            })}
          </ol>
        </div>
      </Section>
      </div>

      <section
        id={beliefs.id}
        aria-labelledby="beliefs-heading"
        className={cn('scroll-mt-36 bg-[var(--landing-section-dark)] text-white', landingSectionY)}
      >
        <div className={landingSection}>
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className={cn(landingEyebrow, 'mb-4 text-white/45 sm:mb-5')}>{beliefs.eyebrow}</p>
              <h2 id="beliefs-heading" className={cn(sectionTitle, 'text-white')}>
                {beliefs.title} <TitleAccent onDark>{beliefs.titleAccent}</TitleAccent>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-[0.9375rem] leading-[1.6] text-white/55 sm:mt-5 sm:text-base sm:leading-[1.65]">
                {beliefs.description}
              </p>
            </div>
          </FadeIn>
          <ol className="mx-auto mt-12 max-w-3xl border-t border-white/10 sm:mt-16">
            {beliefs.items.map(item => (
              <li key={item.step} className="border-b border-white/10">
                <FadeIn>
                  <div className="grid gap-3 py-8 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-8 sm:py-10">
                    <span className="pt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40 tabular-nums">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-[1.375rem] font-semibold leading-snug tracking-[-0.03em] text-white sm:text-[1.5rem]">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-[38rem] text-pretty text-[1.0625rem] leading-[1.7] text-white/62">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              </li>
            ))}
          </ol>
          <FadeIn className="mx-auto mt-12 max-w-xl text-center sm:mt-16">
            <p className="text-pretty text-[0.9375rem] leading-relaxed text-white/55">{contact.lead}</p>
            <a
              href={contact.href}
              className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-medium tracking-[-0.01em] text-white underline decoration-white/25 underline-offset-[0.22em] outline-none transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
            >
              {contact.email}
            </a>
          </FadeIn>
        </div>
      </section>

      <LandingFinalCta />
    </>
  )
}
