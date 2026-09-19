"use client";

import { SocialPlatformIcon } from "@/components/icons/social-platform-icon";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";
import { LogoGlyph, LogoWordmark } from "@/components/common/logo";
import { forwardRef, useRef, type RefObject } from "react";

import {
  PLATFORMS,
  PLATFORMS_SECTION,
  type PlatformId,
} from "./content";
import { FadeIn } from "./fade-in";
import {
  landingContentGap,
  landingSection,
  landingSectionDivider,
} from "./landing-classes";
import { LandingSectionIntro } from "./section-header";

const platformById = Object.fromEntries(
  PLATFORMS.map((platform) => [platform.id, platform]),
) as Record<PlatformId, (typeof PLATFORMS)[number]>;

type BeamSlot =
  | "top-left"
  | "top-center"
  | "top-right"
  | "mid-left"
  | "mid-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const PLATFORM_BEAM_COLORS: Record<
  PlatformId,
  { start: string; stop: string; path: string }
> = {
  instagram: { start: "#f77737", stop: "#c13584", path: "#f0a8d0" },
  youtube: { start: "#ff4e45", stop: "#cc0000", path: "#ffb3b0" },
  facebook: { start: "#4da3ff", stop: "#1877f2", path: "#a8cfff" },
  tiktok: { start: "#25f4ee", stop: "#fe2c55", path: "#9ef0ec" },
  linkedin: { start: "#4ba3f5", stop: "#0a66c2", path: "#a8d4ff" },
  threads: { start: "#6b6b6b", stop: "#000000", path: "#c4c4c4" },
  pinterest: { start: "#ff6b6b", stop: "#e60023", path: "#ffb3b3" },
  twitter: { start: "#8b8b8b", stop: "#000000", path: "#c7c7c7" },
};

const BEAM_NODES: Record<
  BeamSlot,
  {
    platformId: PlatformId;
    curvature?: number;
    reverse?: boolean;
    endYOffset?: number;
    delay?: number;
  }
> = {
  "top-left": {
    platformId: "instagram",
    curvature: -78,
    endYOffset: -8,
    delay: 0,
  },
  "top-center": { platformId: "youtube", curvature: -46, delay: 0.25 },
  "top-right": {
    platformId: "facebook",
    curvature: -78,
    endYOffset: -8,
    reverse: true,
    delay: 0.5,
  },
  "mid-left": { platformId: "tiktok", delay: 0.12 },
  "mid-right": { platformId: "linkedin", reverse: true, delay: 0.38 },
  "bottom-left": {
    platformId: "threads",
    curvature: 78,
    endYOffset: 8,
    delay: 0.75,
  },
  "bottom-center": { platformId: "pinterest", curvature: 46, delay: 1 },
  "bottom-right": {
    platformId: "twitter",
    curvature: 78,
    endYOffset: 8,
    reverse: true,
    delay: 1.25,
  },
};

const BeamCircle = forwardRef<
  HTMLDivElement,
  { className?: string; children: React.ReactNode }
>(({ className, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-10 flex size-9 items-center justify-center rounded-full border border-border bg-background sm:size-10",
      className,
    )}
  >
    {children}
  </div>
));
BeamCircle.displayName = "BeamCircle";

function PlatformNode({
  id,
  nodeRef,
}: {
  id: PlatformId;
  nodeRef: RefObject<HTMLDivElement | null>;
}) {
  const platform = platformById[id];

  return (
    <div className="group/platform flex min-w-[3.75rem] flex-col items-center gap-2 sm:min-w-[4.25rem]">
      <BeamCircle
        ref={nodeRef}
        className="size-auto border-none bg-transparent shadow-none"
      >
        <SocialPlatformIcon
          provider={id}
          size={18}
          framed
          className="size-9 rounded-full ring-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/platform:scale-105 sm:size-10"
        />
      </BeamCircle>
      <span className="text-[0.625rem] font-medium tracking-[-0.01em] whitespace-nowrap text-[var(--landing-muted)]/90 transition-colors duration-200 group-hover/platform:text-[var(--landing-ink)] sm:text-[0.6875rem]">
        {platform.label}
      </span>
    </div>
  );
}

export function LandingPlatforms() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  const topLeftRef = useRef<HTMLDivElement>(null);
  const topCenterRef = useRef<HTMLDivElement>(null);
  const topRightRef = useRef<HTMLDivElement>(null);
  const midLeftRef = useRef<HTMLDivElement>(null);
  const midRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomCenterRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="channels"
      aria-labelledby="channels-heading"
      className={cn(
        "landing-canvas scroll-mt-24 overflow-x-clip py-16 sm:py-20 lg:py-24",
        landingSectionDivider,
      )}
    >
      <div className={landingSection}>
        <FadeIn>
          <LandingSectionIntro
            titleId="channels-heading"
            title={PLATFORMS_SECTION.title}
            titleAccent={PLATFORMS_SECTION.titleAccent}
            description={PLATFORMS_SECTION.description}
          />
        </FadeIn>

        <FadeIn delay={0.08} className={landingContentGap}>
          <figure className="mx-auto w-full max-w-3xl">
            <div
              ref={containerRef}
              className="relative flex w-full items-center justify-center overflow-hidden px-2 py-4 sm:px-4 sm:py-6"
            >
            <div className="relative flex min-h-[15rem] w-full flex-col justify-between gap-7 sm:min-h-[17.5rem] sm:gap-9">
              <div className="flex items-center justify-between px-1">
                <PlatformNode id="instagram" nodeRef={topLeftRef} />
                <PlatformNode id="youtube" nodeRef={topCenterRef} />
                <PlatformNode id="facebook" nodeRef={topRightRef} />
              </div>

              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <PlatformNode id="tiktok" nodeRef={midLeftRef} />
                <div
                  ref={centerRef}
                  className="z-10 flex min-w-[5.5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-[var(--landing-charcoal)] px-4 py-3.5 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_20px_48px_-20px_rgba(0,0,0,0.45)] sm:min-w-[6.25rem] sm:gap-2.5 sm:px-5 sm:py-4"
                >
                  <LogoGlyph size="hero" priority />
                  <LogoWordmark tone="onDark" size="sm" className="text-[0.6875rem] sm:text-xs" />
                </div>
                <PlatformNode id="linkedin" nodeRef={midRightRef} />
              </div>

              <div className="flex items-center justify-between px-1">
                <PlatformNode id="threads" nodeRef={bottomLeftRef} />
                <PlatformNode id="pinterest" nodeRef={bottomCenterRef} />
                <PlatformNode id="twitter" nodeRef={bottomRightRef} />
              </div>
            </div>

            <AnimatedBeam
              containerRef={containerRef}
              fromRef={topLeftRef}
              toRef={centerRef}
              curvature={BEAM_NODES['top-left'].curvature}
              endYOffset={BEAM_NODES['top-left'].endYOffset}
              delay={BEAM_NODES['top-left'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.instagram.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.instagram.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.instagram.stop}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={topCenterRef}
              toRef={centerRef}
              curvature={BEAM_NODES['top-center'].curvature}
              delay={BEAM_NODES['top-center'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.youtube.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.youtube.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.youtube.stop}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={topRightRef}
              toRef={centerRef}
              curvature={BEAM_NODES['top-right'].curvature}
              reverse={BEAM_NODES['top-right'].reverse}
              endYOffset={BEAM_NODES['top-right'].endYOffset}
              delay={BEAM_NODES['top-right'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.facebook.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.facebook.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.facebook.stop}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={midLeftRef}
              toRef={centerRef}
              delay={BEAM_NODES['mid-left'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.tiktok.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.tiktok.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.tiktok.stop}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={midRightRef}
              toRef={centerRef}
              reverse={BEAM_NODES['mid-right'].reverse}
              delay={BEAM_NODES['mid-right'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.linkedin.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.linkedin.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.linkedin.stop}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={bottomLeftRef}
              toRef={centerRef}
              curvature={BEAM_NODES['bottom-left'].curvature}
              endYOffset={BEAM_NODES['bottom-left'].endYOffset}
              delay={BEAM_NODES['bottom-left'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.threads.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.threads.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.threads.stop}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={bottomCenterRef}
              toRef={centerRef}
              curvature={BEAM_NODES['bottom-center'].curvature}
              delay={BEAM_NODES['bottom-center'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.pinterest.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.pinterest.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.pinterest.stop}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={bottomRightRef}
              toRef={centerRef}
              curvature={BEAM_NODES['bottom-right'].curvature}
              reverse={BEAM_NODES['bottom-right'].reverse}
              endYOffset={BEAM_NODES['bottom-right'].endYOffset}
              delay={BEAM_NODES['bottom-right'].delay}
              duration={4.5}
              pathColor={PLATFORM_BEAM_COLORS.twitter.path}
              pathWidth={2}
              pathOpacity={0.18}
              gradientStartColor={PLATFORM_BEAM_COLORS.twitter.start}
              gradientStopColor={PLATFORM_BEAM_COLORS.twitter.stop}
            />
            </div>
            <figcaption className="sr-only">
              Socialista publishes to {PLATFORMS.map((platform) => platform.label).join(", ")}.
            </figcaption>
          </figure>
        </FadeIn>
      </div>
    </section>
  );
}
