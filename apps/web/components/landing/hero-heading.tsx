import { cn } from "@/lib/utils";

import { HERO } from "./content";
import { landingAccentUnderline, landingH1, landingHeroHeadingGlow } from "./landing-classes";

const TITLE_LINE1_PHRASES = HERO.titleLine1.split(/(?<=\.)\s+/);

function WorkspaceDoodle() {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-x-[-6%] bottom-[-0.14em] h-[0.28em] w-[112%]", landingAccentUnderline)}
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M2 8C18 3.5 32 9.5 48 7C64 4.5 78 9 94 6.5C102 5.5 112 7.5 118 5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroHeading() {
  return (
    <div className="relative isolate mx-auto w-full">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[13rem] w-[min(100%,26rem)] -translate-x-1/2 -translate-y-1/2 sm:h-[15rem] sm:w-[30rem] lg:h-[17rem] lg:w-[34rem]",
          landingHeroHeadingGlow,
        )}
      />
      <h1
        id="hero-heading"
        className={cn(
          landingH1,
          "relative mx-auto w-full text-center text-foreground",
        )}
      >
        <span className="block">
          {TITLE_LINE1_PHRASES.map((phrase, index) => (
            <span key={phrase}>
              {index > 0 ? " " : null}
              <span className="whitespace-nowrap">{phrase}</span>
            </span>
          ))}
        </span>
        <span className="mt-[0.16em] block sm:mt-[0.12em]">
          {HERO.titleLine2Prefix}{" "}
          <span className="relative inline-block whitespace-nowrap">
            {HERO.titleLine2Highlight}
            <WorkspaceDoodle />
          </span>
          {HERO.titleLine2Suffix ? ` ${HERO.titleLine2Suffix}` : null}
        </span>
      </h1>
    </div>
  );
}
