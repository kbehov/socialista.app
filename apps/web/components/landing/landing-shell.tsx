import type { ReactNode } from "react";

type LandingShellProps = {
  children: ReactNode;
};

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="landing-canvas relative isolate flex min-h-dvh flex-col bg-(--landing-canvas) text-(--landing-ink)">
      <div aria-hidden className="landing-canvas-atmosphere pointer-events-none absolute inset-0 -z-10" />
      <div className="relative flex w-full min-w-0 flex-1 flex-col [&_main]:flex-1">{children}</div>
    </div>
  );
}
