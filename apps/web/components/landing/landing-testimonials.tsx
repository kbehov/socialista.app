import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { TESTIMONIALS, TESTIMONIALS_SECTION } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap, landingGlassLight } from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

/** Hidden until `TESTIMONIALS` has real customer quotes. */
export function LandingTestimonials() {
  if (TESTIMONIALS.length === 0) return null

  return (
    <Section id="love" landingDivider alt>
      <FadeIn>
        <LandingSectionIntro
          titleId="love-heading"
          eyebrow={TESTIMONIALS_SECTION.eyebrow}
          title={TESTIMONIALS_SECTION.title}
          titleAccent={TESTIMONIALS_SECTION.titleAccent}
        />
      </FadeIn>

      <ul className={cn(landingContentGap, 'columns-1 list-none gap-4 p-0 sm:columns-2 lg:columns-3')}>
        {TESTIMONIALS.map((testimonial, index) => (
          <li key={testimonial.name} className="mb-4 break-inside-avoid">
            <FadeIn delay={0.04 + (index % 3) * 0.04}>
              <figure className={cn(landingGlassLight, 'rounded-[var(--landing-media-radius)] p-6')}>
                <blockquote className="text-pretty text-[0.9375rem] leading-[1.6] text-[var(--landing-ink)]">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar
                    size="sm"
                    className="after:border-[oklch(0_0_0/0.1)] after:mix-blend-normal"
                  >
                    {testimonial.avatar ? <AvatarImage src={testimonial.avatar} alt={testimonial.name} /> : null}
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    <span className="block font-medium text-[var(--landing-ink)]">{testimonial.name}</span>
                    <span className="block text-[var(--landing-muted)]">{testimonial.role}</span>
                  </span>
                </figcaption>
              </figure>
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  )
}
