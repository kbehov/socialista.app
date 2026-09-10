import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { FAQ_ITEMS } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingFaq() {
  return (
    <Section id="faq" border>
      <FadeIn>
        <SectionHeader
          eyebrow="FAQ"
          title="Common questions"
          description="Plans, platforms, credits, and how your workspace stays yours."
          align="center"
        />
      </FadeIn>

      <FadeIn delay={0.06} className="mx-auto mt-12 max-w-2xl">
        <Accordion type="single" collapsible>
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </Section>
  )
}
