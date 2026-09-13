import { cn } from "@/lib/utils";

import { landingBody, landingH2 } from "./landing-classes";

type SectionHeaderProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      <h2 className={landingH2}>{title}</h2>
      {description ? (
        <p
          className={cn(
            landingBody,
            "mt-5",
            align === "center" ? "mx-auto" : "",
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
