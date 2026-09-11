import { Button } from '@/components/ui/button'
import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'
import { getStaticAdTemplates } from '@/services/static-ad-templates.service'
import type { StaticAdTemplateDto } from '@socialista/types'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { STATIC_ADS_SECTION } from './content'
import { FadeIn } from './fade-in'
import { landingMediaCard, landingSection, landingSectionAlt } from './landing-classes'
import { SectionHeader } from './section-header'

const sectionFadeFrom = 'from-[color-mix(in_oklch,var(--surface-0)_55%,var(--background))]'

const TEMPLATE_LIMIT = 8

function splitTemplates(templates: StaticAdTemplateDto[]) {
  const midpoint = Math.ceil(templates.length / 2)
  return [templates.slice(0, midpoint), templates.slice(midpoint)] as const
}

function StaticAdMarqueeCard({ template }: { template: StaticAdTemplateDto }) {
  return (
    <div className="relative w-[11.25rem] shrink-0 sm:w-[12.75rem]">
      <div
        className={cn(
          landingMediaCard,
          'aspect-[4/5] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_5%,transparent),0_28px_52px_-22px_color-mix(in_oklch,var(--foreground)_26%,transparent)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        )}
      >
        <Image
          src={template.imageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 180px, 204px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,color-mix(in_oklch,var(--foreground)_16%,transparent)_100%)]"
        />
      </div>
    </div>
  )
}

function MarqueeFade({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 z-10 w-16 sm:w-24',
        sectionFadeFrom,
        side === 'left' ? 'left-0 bg-gradient-to-r to-transparent' : 'right-0 bg-gradient-to-l to-transparent',
      )}
    />
  )
}

function StaticAdMarqueeRow({
  templates,
  reverse = false,
  durationClass,
}: {
  templates: StaticAdTemplateDto[]
  reverse?: boolean
  durationClass: string
}) {
  return (
    <div className="relative">
      <MarqueeFade side="left" />
      <MarqueeFade side="right" />
      <Marquee
        reverse={reverse}
        pauseOnHover
        repeat={4}
        className={cn('py-2 [--gap:1rem] sm:py-2.5 sm:[--gap:1.15rem]', durationClass)}
      >
        {templates.map(template => (
          <StaticAdMarqueeCard key={template._id} template={template} />
        ))}
      </Marquee>
    </div>
  )
}

export async function LandingStaticAds() {
  let templates: StaticAdTemplateDto[] = []

  try {
    const response = await getStaticAdTemplates({ limit: TEMPLATE_LIMIT, sort: '-createdAt' })
    if (response.success && response.data?.templates?.length) {
      templates = response.data.templates
    }
  } catch {
    return null
  }

  if (templates.length === 0) {
    return null
  }

  const [topRow, bottomRow] = splitTemplates(templates)

  return (
    <section
      id="static-ads"
      className={cn(
        'scroll-mt-20 overflow-x-clip border-t border-border py-14 sm:py-20',
        landingSectionAlt,
      )}
    >
      <div className={landingSection}>
        <FadeIn>
          <SectionHeader
            eyebrow={STATIC_ADS_SECTION.eyebrow}
            title={STATIC_ADS_SECTION.title}
            description={STATIC_ADS_SECTION.description}
            align="center"
          />
        </FadeIn>
      </div>

      <FadeIn delay={0.08} className="relative mt-10 w-full sm:mt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-56 -translate-y-1/2 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,color-mix(in_oklch,var(--foreground)_5%,transparent),transparent_70%)]"
        />
        <div className="relative space-y-3 sm:space-y-4">
          <StaticAdMarqueeRow templates={topRow} durationClass="[--duration:52s]" />
          {bottomRow.length > 0 ? (
            <StaticAdMarqueeRow templates={bottomRow} reverse durationClass="[--duration:58s]" />
          ) : null}
        </div>
      </FadeIn>

      <div className={cn(landingSection, 'mt-9 sm:mt-10')}>
        <FadeIn delay={0.14} className="flex justify-center">
          <Button asChild size="lg" variant="outline" className="group h-11 gap-2 px-6">
            <Link href="/auth/signup">
              {STATIC_ADS_SECTION.cta}
              <ArrowRight className="size-4 transition-transform duration-[180ms] ease-out group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  )
}
