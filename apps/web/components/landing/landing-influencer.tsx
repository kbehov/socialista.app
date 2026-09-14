import {
  Infinity,
  ScanFace,
  SlidersHorizontal,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

import {
  INFLUENCER_SECTION,
  type InfluencerFeatureId,
} from "./content";
import { FadeIn } from "./fade-in";
import { InfluencerPhoneMockup } from "./influencer-phone-mockup";
import {
  landingBody,
  landingContentGap,
  landingH2,
  landingH3,
  landingInfluencerGlow,
} from "./landing-classes";
import { Section } from "./section";

const FEATURE_ICONS: Record<InfluencerFeatureId, LucideIcon> = {
  quality: Smartphone,
  consistency: ScanFace,
  control: SlidersHorizontal,
  ownership: Infinity,
};

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background sm:size-10"
      aria-hidden="true"
    >
      <Icon className="size-[1.125rem] sm:size-5" strokeWidth={1.75} />
    </span>
  );
}

function InfluencerFeature({
  title,
  description,
  icon,
  align,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <article
      className={cn(
        "flex max-w-[18rem] flex-col items-start gap-3 text-left sm:max-w-[20rem] sm:gap-3.5",
        isRight && "lg:items-end lg:text-right",
      )}
    >
      <FeatureIcon icon={icon} />
      <h3 className={landingH3}>{title}</h3>
      <p className={cn(landingBody, "max-w-none text-[0.9375rem] sm:text-base")}>
        {description}
      </p>
    </article>
  );
}

export function LandingInfluencer() {
  const leftFeatures = INFLUENCER_SECTION.features.filter(
    (feature) => feature.side === "left",
  );
  const rightFeatures = INFLUENCER_SECTION.features.filter(
    (feature) => feature.side === "right",
  );

  return (
    <Section id="influencers" border>
      <FadeIn>
        <hgroup className="mx-auto max-w-3xl text-center">
          <h2 id="influencers-heading" className={landingH2}>
            {INFLUENCER_SECTION.title}
          </h2>
          <p className={cn(landingBody, "mx-auto mt-4 max-w-2xl sm:mt-5")}>
            {INFLUENCER_SECTION.eyebrow}
          </p>
        </hgroup>
      </FadeIn>

      <div className={cn(landingContentGap, "relative")}>
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-[6%] top-[12%] bottom-[6%] rounded-full",
            landingInfluencerGlow,
          )}
        />

        <div className="relative mx-auto grid w-full max-w-5xl justify-items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-8 xl:gap-12">
          <ul className="order-2 grid w-full list-none justify-items-start gap-8 p-0 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:justify-items-end lg:gap-14 xl:gap-16">
            {leftFeatures.map((feature, index) => (
              <li key={feature.id}>
                <FadeIn delay={index * 0.06}>
                  <InfluencerFeature
                    title={feature.title}
                    description={feature.description}
                    icon={FEATURE_ICONS[feature.id]}
                    align="right"
                  />
                </FadeIn>
              </li>
            ))}
          </ul>

          <FadeIn
            delay={0.08}
            className="order-1 flex flex-col items-center justify-self-center gap-6 sm:gap-7 lg:order-2"
          >
            <InfluencerPhoneMockup />
            <ShimmerButton
              href="/auth/signup"
              className="h-11 px-6 text-sm font-medium"
            >
              {INFLUENCER_SECTION.cta}
            </ShimmerButton>
          </FadeIn>

          <ul className="order-3 grid w-full list-none justify-items-start gap-8 p-0 sm:grid-cols-2 lg:grid-cols-1 lg:justify-items-start lg:gap-14 xl:gap-16">
            {rightFeatures.map((feature, index) => (
              <li key={feature.id}>
                <FadeIn delay={0.12 + index * 0.06}>
                  <InfluencerFeature
                    title={feature.title}
                    description={feature.description}
                    icon={FEATURE_ICONS[feature.id]}
                    align="left"
                  />
                </FadeIn>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
