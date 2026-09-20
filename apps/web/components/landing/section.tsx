import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import {
  landingSection,
  landingSectionAlt,
  landingSectionDivider,
  landingSectionY,
} from "./landing-classes";

type SectionProps = {
  children: ReactNode;
  className?: string;
  /** Override the default `landingSection` width/padding */
  containerClassName?: string;
  id?: string;
  border?: boolean;
  /** Warm landing hairline instead of default border token */
  landingDivider?: boolean;
  alt?: boolean;
  labelledBy?: string;
};

export function sectionHeadingId(sectionId: string) {
  return `${sectionId}-heading`;
}

export function Section({
  children,
  className,
  containerClassName,
  id,
  border = false,
  landingDivider = false,
  alt = false,
  labelledBy,
}: SectionProps) {
  const headingId = labelledBy ?? (id ? sectionHeadingId(id) : undefined);

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-24",
        landingSectionY,
        border && "border-t border-border",
        landingDivider && landingSectionDivider,
        alt && landingSectionAlt,
        className,
      )}
    >
      <div className={cn(landingSection, containerClassName)}>{children}</div>
    </section>
  );
}

export function SectionInner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(landingSection, className)}>{children}</div>;
}
