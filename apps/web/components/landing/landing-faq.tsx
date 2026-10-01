import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import { FAQ_ITEMS, FAQ_SECTION } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingGlassLight, landingH3, landingNavLink } from "./landing-classes";
import { Section } from "./section";
import { LandingSectionIntro } from "./section-header";

export function LandingFaq() {
  return (
    <Section id="faq" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="faq-heading"
          eyebrow={FAQ_SECTION.eyebrow}
          title={FAQ_SECTION.title}
          titleAccent={FAQ_SECTION.titleAccent}
          description={FAQ_SECTION.description}
        />
      </FadeIn>

      <FadeIn delay={0.06} className={cn('mx-auto max-w-2xl', landingContentGap)}>
        <Accordion
          type="single"
          collapsible
          className={cn(
            landingGlassLight,
            'overflow-hidden rounded-[var(--landing-panel-radius)] px-1 sm:px-2',
            'divide-y divide-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]',
          )}
        >
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="border-none"
            >
              <AccordionTrigger
                className={cn(
                  landingH3,
                  "px-4 py-5 text-left text-[var(--landing-ink)] hover:no-underline data-[state=open]:text-[var(--landing-ink)] sm:px-5",
                )}
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent className={cn(landingBodySm, "px-4 pb-5 text-[var(--landing-muted)] sm:px-5")}>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-center text-sm text-[var(--landing-muted)]">
          {FAQ_SECTION.contactLead}{" "}
          <a href={FAQ_SECTION.contactHref} className={cn(landingNavLink, "font-medium text-[var(--landing-ink)]")}>
            {FAQ_SECTION.contactCta}
          </a>
        </p>
      </FadeIn>
    </Section>
  );
}
