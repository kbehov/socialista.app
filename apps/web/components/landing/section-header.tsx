import { cn } from "@/lib/utils";

import {
  landingBody,
  landingEyebrow,
  landingH2,
  landingSectionLead,
  landingSectionTitle,
  landingSectionTitleAccentSerif,
} from "./landing-classes";

type SectionHeaderProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
  /** Display scale matches feature sections; utility is tighter for FAQ/pricing */
  variant?: "display" | "utility";
};

export function SectionHeader({
  title,
  description,
  align = "left",
  className,
  titleId,
  variant = "utility",
}: SectionHeaderProps) {
  const titleClass =
    variant === "display" ? landingSectionTitle : landingH2;
  const descriptionClass =
    variant === "display" ? landingSectionLead : landingBody;

  return (
    <hgroup
      className={cn(
        variant === "display" ? "mx-auto max-w-3xl" : undefined,
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      <h2 id={titleId} className={titleClass}>
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            descriptionClass,
            "mt-4 sm:mt-5",
            align === "center" && variant === "utility" && "mx-auto max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </hgroup>
  );
}

type LandingSectionIntroProps = {
  title: string;
  titleAccent?: string;
  description?: string;
  /** Small uppercase kicker above the title */
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
  /** Light page sections vs dark bands (e.g. slideshows) */
  tone?: "light" | "dark";
};

export function LandingSectionIntro({
  title,
  titleAccent,
  description,
  eyebrow,
  align = "center",
  className,
  titleId,
  tone = "light",
}: LandingSectionIntroProps) {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl",
        align === "center" && "text-center",
        align === "center" && description && "sm:max-w-[40rem]",
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn(landingEyebrow, "mb-4 sm:mb-5", isDark && "text-white/50")}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={titleId}
        className={cn(landingSectionTitle, isDark && "text-white")}
      >
        {title}
        {titleAccent ? (
          <>
            {" "}
            <span
              className={cn(
                landingSectionTitleAccentSerif,
                isDark && "text-[color-mix(in_srgb,var(--landing-canvas)_92%,white)]",
              )}
            >
              {titleAccent}
            </span>
          </>
        ) : null}
      </h2>
      {description ? (
        <p
          className={cn(
            landingSectionLead,
            'mt-4 sm:mt-5',
            isDark &&
              'text-[color-mix(in_srgb,var(--landing-canvas)_68%,transparent)]',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
