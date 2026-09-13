import { PAGE_METADATA } from "@/components/landing/content";
import { LandingAudience } from "@/components/landing/landing-audience";
import { LandingCompare } from "@/components/landing/landing-compare";
import { LandingContext } from "@/components/landing/landing-context";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFeatureMarquee } from "@/components/landing/landing-feature-marquee";
import { LandingFinalCta } from "@/components/landing/landing-final-cta";
import { LandingGallery } from "@/components/landing/landing-gallery";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingLoop } from "@/components/landing/landing-loop";
import { LandingMeasure } from "@/components/landing/landing-measure";
import { LandingPlatforms } from "@/components/landing/landing-platforms";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingProblem } from "@/components/landing/landing-problem";
import { LandingPublish } from "@/components/landing/landing-publish";
import { LandingStudio } from "@/components/landing/landing-studio";
import { LandingUgcReel } from "@/components/landing/landing-ugc-reel";
import { LandingWorkflow } from "@/components/landing/landing-workflow";
import { formatProductPrice } from "@/lib/pricing";
import { getPolarProducts } from "@/services/billing.service";
import type { PolarProduct } from "@socialista/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: PAGE_METADATA.title,
  },
  description: PAGE_METADATA.description,
  openGraph: {
    title: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    type: "website",
    siteName: "Socialista",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
  },
  alternates: {
    canonical: "/",
  },
};

function buildJsonLd(products: PolarProduct[] | undefined) {
  const offers =
    products && products.length > 0
      ? products.map((product) => {
          const pricing = formatProductPrice(product);
          const price = product.prices.find(
            (p) => p.priceAmount != null && p.priceAmount > 0,
          );
          return {
            "@type": "Offer",
            name: product.name,
            price:
              price?.priceAmount != null
                ? (price.priceAmount / 100).toFixed(2)
                : pricing.amount,
            priceCurrency: price?.priceCurrency?.toUpperCase() ?? "USD",
            availability: "https://schema.org/InStock",
          };
        })
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Socialista",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: PAGE_METADATA.description,
    ...(offers ? { offers } : {}),
  };
}

export default async function HomePage() {
  const polarResponse = await getPolarProducts({ recurringOnly: true });
  const products = polarResponse.data?.products ?? [];
  const jsonLd = buildJsonLd(polarResponse.data?.products);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHero />
      <LandingPlatforms />
      <LandingProblem />
      <LandingLoop />
      <LandingStudio />
      <LandingUgcReel />
      <LandingGallery />
      <LandingPublish />
      <LandingContext />
      <LandingMeasure />
      <LandingAudience />
      <LandingWorkflow />
      <LandingCompare />
      <LandingPricing
        products={products}
        loadError={
          polarResponse.success
            ? null
            : (polarResponse.message ?? "Failed to load plans")
        }
      />
      <LandingFaq />
      <LandingFinalCta />
    </>
  );
}
