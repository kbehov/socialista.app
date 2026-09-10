import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { FINAL_CTA } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { SectionInner } from './section'

export function LandingFinalCta() {
  return (
    <section className={styles.finalCta}>
      <SectionInner className={`${styles.finalCtaInner} py-16 sm:py-20`}>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] sm:text-4xl">{FINAL_CTA.title}</h2>
          <p className={`${styles.finalCtaMuted} mt-4 text-[0.9375rem] leading-7 sm:text-base`}>
            {FINAL_CTA.description}
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="h-11 px-6">
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </div>
        </FadeIn>
      </SectionInner>
    </section>
  )
}
