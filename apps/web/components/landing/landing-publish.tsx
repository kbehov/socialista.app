"use client";

import { SocialPlatformIcon } from "@/components/icons/social-platform-icon";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";

import { PLATFORMS, PUBLISH, type PlatformId } from "./content";
import { FadeIn } from "./fade-in";
import { landingH2 } from "./landing-classes";
import { Section } from "./section";

type OrbitIcon = {
  id: string;
  platform: PlatformId;
  angle: number;
  radiusX: number;
  radiusY: number;
  duration: number;
  delay: number;
  y: number[];
  x: number[];
  hiddenOnMobile?: boolean;
};

function orbitPosition(angle: number, radiusX: number, radiusY: number) {
  const rad = (angle * Math.PI) / 180;
  const x = 50 + radiusX * Math.cos(rad);
  const y = 50 + radiusY * Math.sin(rad);

  return {
    left: `${x.toFixed(3)}%`,
    top: `${y.toFixed(3)}%`,
  };
}

const ORBIT_ICONS: OrbitIcon[] = [
  {
    id: "instagram",
    platform: "instagram",
    angle: 248,
    radiusX: 44,
    radiusY: 41,
    duration: 7.4,
    delay: 0,
    y: [0, -7, 3, -5, 0],
    x: [0, 3, -2, 2, 0],
  },
  {
    id: "youtube",
    platform: "youtube",
    angle: 274,
    radiusX: 42,
    radiusY: 43,
    duration: 8.2,
    delay: 0.3,
    y: [0, -6, 4, -4, 0],
    x: [0, -2, 2, -1, 0],
  },
  {
    id: "facebook",
    platform: "facebook",
    angle: 300,
    radiusX: 44,
    radiusY: 41,
    duration: 7.8,
    delay: 0.55,
    y: [0, -5, 5, -3, 0],
    x: [0, -3, 2, -2, 0],
  },
  {
    id: "linkedin",
    platform: "linkedin",
    angle: 332,
    radiusX: 45,
    radiusY: 40,
    duration: 8.6,
    delay: 0.8,
    y: [0, 4, -6, 3, 0],
    x: [0, -2, 3, -2, 0],
    hiddenOnMobile: true,
  },
  {
    id: "twitter",
    platform: "twitter",
    angle: 28,
    radiusX: 44,
    radiusY: 40,
    duration: 7.2,
    delay: 0.45,
    y: [0, 5, -4, 4, 0],
    x: [0, 3, -2, 2, 0],
  },
  {
    id: "threads",
    platform: "threads",
    angle: 138,
    radiusX: 44,
    radiusY: 40,
    duration: 8.8,
    delay: 0.65,
    y: [0, 6, -5, 4, 0],
    x: [0, -3, 2, -2, 0],
  },
  {
    id: "pinterest",
    platform: "pinterest",
    angle: 168,
    radiusX: 43,
    radiusY: 39,
    duration: 7.6,
    delay: 0.95,
    y: [0, -4, 5, -3, 0],
    x: [0, 2, -3, 2, 0],
    hiddenOnMobile: true,
  },
  {
    id: "tiktok",
    platform: "tiktok",
    angle: 204,
    radiusX: 45,
    radiusY: 40,
    duration: 9,
    delay: 0.2,
    y: [0, 5, -6, 4, 0],
    x: [0, 4, -2, 3, 0],
    hiddenOnMobile: true,
  },
];

const PLATFORM_ICON_COLOR: Record<PlatformId, string> = {
  instagram: "text-[#E1306C]",
  tiktok: "text-black",
  youtube: "text-[#FF0000]",
  linkedin: "text-[#0A66C2]",
  facebook: "text-[#1877F2]",
  threads: "text-black",
  pinterest: "text-[#E60023]",
  twitter: "text-black",
};

function PublishFloatingIcon({
  icon,
  reduceMotion,
}: {
  icon: OrbitIcon;
  reduceMotion: boolean | null;
}) {
  const position = orbitPosition(icon.angle, icon.radiusX, icon.radiusY);

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2",
        icon.hiddenOnMobile && "hidden sm:block",
      )}
      style={position}
      initial={false}
      animate={
        reduceMotion
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 1, x: icon.x, y: icon.y }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: icon.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: icon.delay,
            }
      }
    >
      <div
        className="flex size-11 items-center justify-center rounded-[1.125rem] border border-black/[0.05] bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.08),0_10px_28px_-8px_rgba(0,0,0,0.1)] sm:size-12 sm:rounded-[1.25rem]"
      >
        <SocialPlatformIcon
          provider={icon.platform}
          framed={false}
          size={20}
          className={PLATFORM_ICON_COLOR[icon.platform]}
        />
      </div>
    </motion.div>
  );
}

export function LandingPublish() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="publish" border>
      <div className="relative mx-auto w-full max-w-5xl px-2 sm:px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] top-[14%] bottom-[30%] rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--foreground)_7%,transparent)_0%,color-mix(in_oklch,var(--foreground)_2%,transparent)_48%,transparent_74%)]"
        />

        <div className="relative mx-auto aspect-[1.05/1] w-full max-w-[40rem] min-h-[24rem] sm:min-h-[28rem] lg:min-h-[30rem]">
          {ORBIT_ICONS.map((icon) => (
            <PublishFloatingIcon
              key={icon.id}
              icon={icon}
              reduceMotion={reduceMotion}
            />
          ))}

          <FadeIn className="absolute inset-[18%] z-20 flex flex-col items-center justify-center text-center sm:inset-[20%]">
            <hgroup>
              <h2 id="publish-heading" className={landingH2}>
                {PUBLISH.titleLines.map((line, index) => (
                  <span key={line}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </h2>
              <p className="mt-5 max-w-[30rem] text-[1.0625rem] leading-[1.7] text-pretty text-muted-foreground sm:mt-6">
                {PUBLISH.description}
              </p>
            </hgroup>

            <ShimmerButton
              href="/auth/signup"
              background="var(--foreground)"
              shimmerColor="var(--background)"
              className="mt-8 h-12 bg-foreground px-8 text-[0.9375rem] font-semibold text-background shadow-[0_4px_18px_-4px_rgba(0,0,0,0.35)] sm:mt-9"
            >
              {PUBLISH.cta}
            </ShimmerButton>
          </FadeIn>
        </div>

        <p className="sr-only">
          Schedule and publish to {PLATFORMS.map((platform) => platform.label).join(", ")} from Socialista.
        </p>
      </div>
    </Section>
  );
}
