import { FAQ_ITEMS } from '@/app/(home)/_components/landing/content'
import { FadeIn } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { SectionHeader } from '@/app/(home)/_components/landing/section-header'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border py-16 sm:py-24">
      <div className={`${styles.section} grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:gap-20`}>
        <FadeIn>
          <SectionHeader
            eyebrow="FAQ"
            title="Common questions"
            description="Straight answers about Socialista, early access, and how we use your email."
          />
        </FadeIn>

        <FadeIn delay={0.06}>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map(item => (
              <AccordionItem key={item.question} value={item.question} className="border-border">
                <AccordionTrigger className="py-5 text-left text-sm font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  )
}
