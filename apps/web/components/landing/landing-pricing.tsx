"use client";

import { PricingCard } from "@/components/cards/pricing-card";
import { Button } from "@/components/ui/button";
import type { PolarProduct } from "@socialista/types";
import Link from "next/link";

import { HERO, PRICING_SECTION } from "./content";
import { FadeIn } from "./fade-in";
import {
  landingContentGap,
  landingCtaPrimary,
  landingSectionPricing,
} from "./landing-classes";
import { cn } from "@/lib/utils";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

type LandingPricingProps = {
  products: PolarProduct[];
  loadError?: string | null;
};

function pickFeaturedIndex(products: PolarProduct[]): number {
  if (products.length === 0) return -1;
  if (products.length >= 3) return 1;
  const firstPaid = products.findIndex((p) => {
    const price = p.prices[0];
    return price && price.amountType !== "free" && (price.priceAmount ?? 0) > 0;
  });
  return firstPaid >= 0 ? firstPaid : 0;
}

export function LandingPricing({
  products,
  loadError = null,
}: LandingPricingProps) {
  const featuredIndex = pickFeaturedIndex(products);
  const hasProducts = products.length > 0 && !loadError;

  return (
    <Section id="pricing" landingDivider alt containerClassName={landingSectionPricing}>
      <FadeIn>
        <SectionHeader
          titleId="pricing-heading"
          title={
            hasProducts ? PRICING_SECTION.title : PRICING_SECTION.fallbackTitle
          }
          description={
            hasProducts
              ? PRICING_SECTION.description
              : PRICING_SECTION.fallbackDescription
          }
          align="center"
          variant="display"
        />
      </FadeIn>

      {hasProducts ? (
        <FadeIn
          delay={0.06}
          className={cn(
            landingContentGap,
            "grid items-stretch gap-6 sm:gap-7 lg:gap-8",
            products.length === 1 && "mx-auto max-w-md",
            products.length === 2 &&
              "md:mx-auto md:max-w-4xl md:grid-cols-2",
            products.length === 3 && "lg:grid-cols-3",
            products.length >= 4 && "md:grid-cols-2 xl:grid-cols-4",
          )}
        >
          {products.map((product, index) => (
            <PricingCard
              key={product.id}
              product={product}
              isFeatured={index === featuredIndex}
              ctaLabel={HERO.primaryCta}
              checkoutUrl={`/auth/signup?plan=${encodeURIComponent(product.id)}`}
            />
          ))}
        </FadeIn>
      ) : (
        <FadeIn
          delay={0.06}
          className={`${landingContentGap} flex justify-center`}
        >
          <Button asChild size="lg" className={landingCtaPrimary}>
            <Link href="/auth/signup">{HERO.primaryCta}</Link>
          </Button>
        </FadeIn>
      )}
    </Section>
  );
}
