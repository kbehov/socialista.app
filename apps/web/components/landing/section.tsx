import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import {
  landingSection,
  landingSectionAlt,
  landingSectionY,
} from "./landing-classes";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  border?: boolean;
  alt?: boolean;
  labelledBy?: string;
};

export function sectionHeadingId(sectionId: string) {
  return `${sectionId}-heading`;
}

export function Section({
  children,
  className,
  id,
  border = false,
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
        alt && landingSectionAlt,
        className,
      )}
    >
      <div className={landingSection}>{children}</div>
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
