import {
  Infinity,
  ScanFace,
  SlidersHorizontal,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  INFLUENCER_SECTION,
  type InfluencerFeatureId,
} from "./content";
import { FadeIn } from "./fade-in";
import { InfluencerSwipeCarousel } from "./influencer-swipe-carousel";
import {
  landingBody,
  landingContentGap,
  landingFeatureCaptionTitle,
  landingInfluencerGlow,
} from "./landing-classes";
import { Section } from "./section";
import { SectionCta } from "./section-cta";
import { LandingSectionIntro } from "./section-header";

const FEATURE_ICONS: Record<InfluencerFeatureId, LucideIcon> = {
  quality: Smartphone,
  consistency: ScanFace,
  control: SlidersHorizontal,
  ownership: Infinity,
};

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--landing-stone)_70%,transparent)] bg-[color-mix(in_srgb,var(--landing-stone)_28%,white)] text-[var(--landing-ink)] sm:size-10"
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
      <h3 className={landingFeatureCaptionTitle}>{title}</h3>
      <p className={cn(landingBody, 'max-w-none')}>
        {description}
      </p>
    </article>
  );
}

function FeatureList({
  features,
  align,
  baseDelay,
}: {
  features: (typeof INFLUENCER_SECTION.features)[number][];
  align: "left" | "right";
  baseDelay: number;
}) {
  return (
    <ul className="flex list-none flex-col gap-8 p-0 sm:gap-10 lg:gap-14 xl:gap-16">
      {features.map((feature, index) => (
        <li key={feature.id}>
          <FadeIn delay={baseDelay + index * 0.06}>
            <InfluencerFeature
              title={feature.title}
              description={feature.description}
              icon={FEATURE_ICONS[feature.id]}
              align={align}
            />
          </FadeIn>
        </li>
      ))}
    </ul>
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
    <Section id="influencers" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="influencers-heading"
          eyebrow={INFLUENCER_SECTION.eyebrow}
          title={INFLUENCER_SECTION.title}
          titleAccent={INFLUENCER_SECTION.titleAccent}
          description={INFLUENCER_SECTION.description}
        />
      </FadeIn>

      <div className={cn(landingContentGap, "relative")}>
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-[6%] top-[12%] bottom-[6%] rounded-full",
            landingInfluencerGlow,
          )}
        />

        {/* Single render: carousel first on mobile, features flank it on lg */}
        <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-8 xl:gap-12">
          <div className="flex min-w-0 lg:justify-end">
            <FeatureList features={leftFeatures} align="right" baseDelay={0} />
          </div>

          <div className="order-first flex w-full flex-col items-center gap-6 sm:col-span-2 sm:gap-7 lg:order-none lg:col-span-1 lg:w-auto">
            <InfluencerSwipeCarousel />
            <FadeIn delay={0.08}>
              <SectionCta label={INFLUENCER_SECTION.cta} />
            </FadeIn>
          </div>

          <div className="flex min-w-0 lg:justify-start">
            <FeatureList features={rightFeatures} align="left" baseDelay={0.12} />
          </div>
        </div>
      </div>
    </Section>
  );
}
