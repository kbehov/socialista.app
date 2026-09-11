import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { FINAL_CTA } from './content'
import { FadeIn } from './fade-in'
import { IMG } from './media'
import { MediaFrame } from './media-frame'
import { SectionInner } from './section'

const FACES = [IMG.p1, IMG.p3, IMG.p5, IMG.p8, IMG.p13] as const

export function LandingFinalCta() {
  return (
    <section
      className="relative overflow-hidden border-y border-border bg-foreground text-background before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_55%_80%_at_12%_50%,color-mix(in_oklch,var(--background)_10%,transparent),transparent_60%),radial-gradient(ellipse_45%_70%_at_88%_30%,color-mix(in_oklch,var(--guest-accent)_18%,transparent),transparent_55%)] dark:bg-surface-1 dark:text-foreground"
    >
      <SectionInner className="relative py-16 sm:py-24">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center" aria-hidden="true">
            {FACES.map((src, index) => (
              <MediaFrame
                key={src}
                src={src}
                className={cn(
                  'relative size-11 overflow-hidden rounded-full border-2 border-foreground dark:border-surface-1',
                  index > 0 && '-ml-[0.55rem]',
                )}
                sizes="48px"
              />
            ))}
          </div>
          <h2 className="text-[1.875rem] font-semibold tracking-[-0.035em] text-inherit sm:text-[2.5rem] sm:leading-[1.1]">
            {FINAL_CTA.title}
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-7 text-[color-mix(in_oklch,var(--background)_65%,transparent)] sm:text-base dark:text-muted-foreground">
            {FINAL_CTA.description}
          </p>
          <div className="mt-9 flex justify-center">
            <Button asChild size="lg" className="group h-12 px-7">
              <Link href="/auth/signup">
                {FINAL_CTA.cta}
                <ArrowRight className="size-4 transition-transform duration-[180ms] ease-out group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </SectionInner>
    </section>
  )
}
