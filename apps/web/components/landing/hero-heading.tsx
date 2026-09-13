import { HERO } from "./content";
import { landingH1 } from "./landing-classes";

function WorkspaceDoodle() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-[-4%] -bottom-[0.18em] h-[0.35em] w-[108%] text-pink-400/80 dark:text-pink-400/70"
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
      className={`${landingH1} mx-auto w-full max-w-5xl text-center text-foreground`}
    >
      <span className="block">{HERO.titleLine1}</span>
      <span className="mt-1 block sm:mt-1.5">
        {HERO.titleLine2Prefix}{" "}
        <span className="relative inline-block">
          {HERO.titleLine2Highlight}
          <WorkspaceDoodle />
        </span>{" "}
        {HERO.titleLine2Suffix}
      </span>
    </h1>
  );
}
