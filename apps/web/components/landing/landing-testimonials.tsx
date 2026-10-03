import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

import { TESTIMONIALS, TESTIMONIALS_RATING, TESTIMONIALS_SECTION, type Testimonial } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap, landingGlassLight } from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

function StarRow({ rating, label }: { rating: number; label: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)))

  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            'size-3.5',
            index < filled
              ? 'fill-[var(--landing-ink)] text-[var(--landing-ink)]'
              : 'text-[color-mix(in_srgb,var(--landing-ink)_18%,transparent)]',
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className={cn(landingGlassLight, 'rounded-[var(--landing-media-radius)] p-6')}>
      {typeof testimonial.rating === 'number' ? (
        <StarRow rating={testimonial.rating} label={`${testimonial.rating} out of 5`} />
      ) : null}
      <blockquote
        className={cn(
          'text-pretty text-[0.9375rem] leading-[1.6] text-[var(--landing-ink)]',
          typeof testimonial.rating === 'number' && 'mt-3',
        )}
      >
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar size="sm" className="after:border-[oklch(0_0_0/0.1)] after:mix-blend-normal">
          {testimonial.avatar ? <AvatarImage src={testimonial.avatar} alt="" /> : null}
          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-sm">
          <span className="block font-medium text-[var(--landing-ink)]">{testimonial.name}</span>
          <span className="block text-[var(--landing-muted)]">{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

/** Hidden until `TESTIMONIALS` has real customer quotes. */
export function LandingTestimonials() {
  if (TESTIMONIALS.length === 0) return null

  return (
    <Section id="love" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="love-heading"
          eyebrow={TESTIMONIALS_SECTION.eyebrow}
          title={TESTIMONIALS_SECTION.title}
          titleAccent={TESTIMONIALS_SECTION.titleAccent}
        />
        {TESTIMONIALS_RATING ? (
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[var(--landing-muted)]">
            <StarRow rating={5} label={TESTIMONIALS_RATING.score} />
            <span className="font-semibold tabular-nums tracking-[-0.02em] text-[var(--landing-ink)]">
              {TESTIMONIALS_RATING.score}
            </span>
            <span>{TESTIMONIALS_RATING.label}</span>
          </p>
        ) : null}
      </FadeIn>

      <ul className={cn(landingContentGap, 'columns-1 list-none gap-4 p-0 sm:columns-2 lg:columns-3')}>
        {TESTIMONIALS.map((testimonial, index) => (
          <li key={testimonial.name} className="mb-4 break-inside-avoid">
            <FadeIn delay={0.04 + (index % 3) * 0.04}>
              <TestimonialCard testimonial={testimonial} />
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  )
}
