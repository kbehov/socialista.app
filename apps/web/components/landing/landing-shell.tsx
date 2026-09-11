import type { ReactNode } from 'react'

type LandingShellProps = {
  children: ReactNode
}

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div
      className="relative isolate bg-background text-foreground before:pointer-events-none before:fixed before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_80%_46%_at_50%_-18%,color-mix(in_oklch,var(--foreground)_4.5%,transparent),transparent_70%),radial-gradient(ellipse_50%_36%_at_100%_0%,color-mix(in_oklch,var(--guest-accent)_7%,transparent),transparent_58%)]"
    >
      {children}
    </div>
  )
}
