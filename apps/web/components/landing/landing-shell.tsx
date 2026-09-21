import type { ReactNode } from "react";

type LandingShellProps = {
  children: ReactNode;
};

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="landing-canvas relative isolate min-h-dvh bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <div aria-hidden className="landing-canvas-atmosphere pointer-events-none absolute inset-0" />
      {children}
    </div>
  );
}
