import { cn } from "@/lib/utils";

import { HERO } from "./content";
import { landingH1 } from "./landing-classes";

const TITLE_LINE1_PHRASES = HERO.titleLine1.split(/(?<=\.)\s+/);

function WorkspaceDoodle() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-[-6%] bottom-[-0.14em] h-[0.28em] w-[112%] text-pink-400/80 dark:text-pink-400/70"
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
    <h1
      id="hero-heading"
      className={cn(
        landingH1,
        "mx-auto w-full text-center text-foreground",
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
  );
}
