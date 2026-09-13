import type { ReactNode } from "react";

type LandingShellProps = {
  children: ReactNode;
};

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="relative isolate min-h-dvh bg-background text-foreground before:pointer-events-none before:fixed before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_70%_42%_at_50%_-20%,color-mix(in_oklch,var(--foreground)_3.5%,transparent),transparent_72%)]">
      {children}
    </div>
  );
}
