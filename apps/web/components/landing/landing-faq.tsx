import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import { FAQ_ITEMS, FAQ_SECTION } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingH3 } from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingFaq() {
  return (
    <Section id="faq" landingDivider>
      <FadeIn>
        <SectionHeader
          titleId="faq-heading"
          title={FAQ_SECTION.title}
          description={FAQ_SECTION.description}
          align="center"
          variant="display"
        />
      </FadeIn>

      <FadeIn delay={0.06} className={`mx-auto max-w-2xl ${landingContentGap}`}>
        <Accordion
          type="single"
          collapsible
          className="divide-y divide-[color-mix(in_srgb,var(--landing-stone)_78%,transparent)]"
        >
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="border-none"
            >
              <AccordionTrigger
                className={`${landingH3} py-5 text-left text-[var(--landing-ink)] hover:no-underline data-[state=open]:text-[var(--landing-ink)]`}
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent className={cn(landingBodySm, 'pb-5 text-[var(--landing-muted)]')}>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </Section>
  );
}
