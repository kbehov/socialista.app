import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { getStaticAdTemplates } from "@/services/static-ad-templates.service";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GALLERY } from "./content";
import { FadeIn } from "./fade-in";
import {
  landingContentGap,
  landingCtaSecondary,
  landingMediaCard,
  landingSection,
  landingSectionY,
} from "./landing-classes";
import { GALLERY_FALLBACK } from "./media";
import { SectionHeader } from "./section-header";

const sectionFadeFrom =
  "from-[color-mix(in_oklch,var(--surface-0)_55%,var(--background))]";
const TEMPLATE_LIMIT = 8;

type GalleryItem = { id: string; imageUrl: string };

function splitItems(items: GalleryItem[]) {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)] as const;
}

function GalleryCard({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  return (
    <div className="relative w-44 shrink-0 sm:w-52">
      <div className={cn(landingMediaCard, "aspect-[4/5]")}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 640px) 176px, 208px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

function MarqueeFade({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 z-10 w-16 sm:w-24",
        sectionFadeFrom,
        side === "left"
          ? "left-0 bg-gradient-to-r to-transparent"
          : "right-0 bg-gradient-to-l to-transparent",
      )}
    />
  );
}

function GalleryRow({
  items,
  reverse = false,
  durationClass,
  startIndex = 0,
}: {
  items: GalleryItem[];
  reverse?: boolean;
  durationClass: string;
  startIndex?: number;
}) {
  return (
    <div className="relative">
      <MarqueeFade side="left" />
      <MarqueeFade side="right" />
      <Marquee
        reverse={reverse}
        pauseOnHover
        repeat={4}
        className={cn("py-2 [--gap:1rem]", durationClass)}
      >
        {items.map((item, index) => (
          <GalleryCard
            key={item.id}
            imageUrl={item.imageUrl}
            alt={`Static ad example ${startIndex + index + 1}`}
          />
        ))}
      </Marquee>
    </div>
  );
}

export async function LandingGallery() {
  let items: GalleryItem[] = GALLERY_FALLBACK.map((imageUrl, index) => ({
    id: `fallback-${index}`,
    imageUrl,
  }));

  try {
    const response = await getStaticAdTemplates({
      limit: TEMPLATE_LIMIT,
      sort: "-createdAt",
    });
    const templates = response.data?.templates;
    if (response.success && templates && templates.length > 0) {
      items = templates.map((template) => ({
        id: template._id,
        imageUrl: template.imageUrl,
      }));
    }
  } catch {
    // Keep Unsplash fallback.
  }

  const [topRow, bottomRow] = splitItems(items);

  return (
    <section
      id="ads"
      aria-labelledby="ads-heading"
      className={cn(
        "scroll-mt-24 overflow-x-clip border-t border-border",
        landingSectionY,
      )}
    >
      <div className={landingSection}>
        <FadeIn>
          <SectionHeader
            titleId="ads-heading"
            title={GALLERY.title}
            description={GALLERY.description}
            align="center"
          />
        </FadeIn>
      </div>

      <FadeIn delay={0.08} className={`relative w-full ${landingContentGap}`}>
        <figure className="relative space-y-3 sm:space-y-4">
          <GalleryRow items={topRow} durationClass="[--duration:52s]" />
          {bottomRow.length > 0 ? (
            <GalleryRow
              items={bottomRow}
              reverse
              durationClass="[--duration:58s]"
              startIndex={topRow.length}
            />
          ) : null}
          <figcaption className="sr-only">
            Example static ads generated from a product catalog in Socialista.
          </figcaption>
        </figure>
      </FadeIn>

      <div className={cn(landingSection, "mt-12")}>
        <FadeIn delay={0.14} className="flex justify-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className={`group ${landingCtaSecondary}`}
          >
            <Link href="/auth/signup">
              {GALLERY.cta}
              <ArrowRight className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
