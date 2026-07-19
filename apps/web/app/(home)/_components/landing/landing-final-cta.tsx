import { FINAL_CTA } from '@/app/(home)/_components/landing/content'
import { FadeIn } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { WaitlistForm } from '@/app/(home)/_components/landing/waitlist-form'
import { Suspense } from 'react'

function FormFallback() {
  return <div className="h-11 animate-pulse rounded-lg border border-border bg-muted/40" aria-hidden="true" />
}

export function LandingFinalCta() {
  return (
    <section className={styles.finalCta}>
      <div className={`${styles.section} ${styles.finalCtaInner} py-16 sm:py-24`}>
        <FadeIn className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl sm:leading-[1.12]">
            {FINAL_CTA.title}
          </h2>
          <p className={`mx-auto mt-4 max-w-md text-sm leading-7 sm:text-base ${styles.finalCtaMuted}`}>
            {FINAL_CTA.description}
          </p>

          <div className={`${styles.finalCtaCard} mx-auto mt-10 max-w-md`}>
            <Suspense fallback={<FormFallback />}>
              <WaitlistForm inset />
            </Suspense>
          </div>

          <p className={`mt-5 text-xs ${styles.finalCtaMuted}`}>{FINAL_CTA.reassurance}</p>
        </FadeIn>
      </div>
    </section>
  )
}
