import { cn } from "@/lib/utils";

import {
  landingBody,
  landingEyebrow,
  landingH2,
  landingHeroEyebrow,
  landingSectionLead,
  landingSectionTitle,
  landingSectionTitleAccent,
} from "./landing-classes";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
  /** Display scale matches feature sections; utility is tighter for FAQ/pricing */
  variant?: "display" | "utility";
};

export function SectionHeader({
  title,
  description,
  eyebrow,
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
      {eyebrow ? (
        <p className={cn(landingEyebrow, "mb-4")}>{eyebrow}</p>
      ) : null}
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
  eyebrow?: string;
  eyebrowTone?: "caps" | "accent";
  align?: "left" | "center";
  className?: string;
  titleId?: string;
};

export function LandingSectionIntro({
  title,
  titleAccent,
  description,
  eyebrow,
  eyebrowTone = "caps",
  align = "center",
  className,
  titleId,
}: LandingSectionIntroProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl",
        align === "center" && "text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            eyebrowTone === "accent" ? landingHeroEyebrow : landingEyebrow,
            eyebrowTone === "caps" && "mb-4",
            eyebrowTone === "accent" && "mb-3 sm:mb-4",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={titleId}
        className={cn(landingSectionTitle, eyebrow ? "mt-0" : undefined)}
      >
        {title}
        {titleAccent ? (
          <>
            {" "}
            <span className={landingSectionTitleAccent}>{titleAccent}</span>
          </>
        ) : null}
      </h2>
      {description ? (
        <p className={cn(landingSectionLead, "mt-5")}>{description}</p>
      ) : null}
    </div>
  );
}
