import { cn } from "@/lib/utils";

import { landingBody, landingEyebrow, landingH2 } from "./landing-classes";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
};

export function SectionHeader({
  title,
  description,
  eyebrow,
  align = "left",
  className,
  titleId,
}: SectionHeaderProps) {
  return (
    <hgroup
      className={cn(
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn(landingEyebrow, "mb-4")}>{eyebrow}</p>
      ) : null}
      <h2 id={titleId} className={landingH2}>
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            landingBody,
            "mt-4 sm:mt-5",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </hgroup>
  );
}
