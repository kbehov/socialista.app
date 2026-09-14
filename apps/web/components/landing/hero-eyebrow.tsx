import type { LucideIcon } from 'lucide-react'
import { ShieldCheck, Timer, Zap } from 'lucide-react'

import { HERO_PROOF_POINTS } from './content'

const ITEMS: { icon: LucideIcon; iconClass: string }[] = [
  { icon: Zap, iconClass: 'text-accent-orange' },
  { icon: Timer, iconClass: 'text-[color-mix(in_oklch,var(--guest-accent)_85%,var(--foreground))]' },
  { icon: ShieldCheck, iconClass: 'text-[color-mix(in_oklch,var(--accent-orange)_55%,var(--foreground))]' },
]

export function HeroEyebrow() {
  return (
    <ul className="mx-auto flex max-w-full items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--foreground)_10%,var(--border))] bg-background/65 px-0.5 py-0.5 text-xs text-foreground/85 shadow-[0_1px_0_color-mix(in_oklch,var(--background)_50%,transparent)_inset,0_8px_24px_-16px_color-mix(in_oklch,var(--foreground)_12%,transparent)] backdrop-blur-md tracking-[-0.01em] sm:px-1.5 sm:py-1 sm:text-[0.8125rem]">
      {HERO_PROOF_POINTS.map((point, index) => {
        const item = ITEMS[index]
        if (!item) return null
        const Icon = item.icon
        return (
          <li key={point} className="flex items-center">
            {index > 0 ? <span aria-hidden="true" className="mx-1 h-2.5 w-px bg-border sm:mx-2 sm:h-3" /> : null}
            <span className="inline-flex items-center gap-1 px-1.5 py-1 sm:gap-1.5 sm:px-2.5">
              <Icon className={`size-3 shrink-0 sm:size-3.5 ${item.iconClass}`} strokeWidth={2} aria-hidden="true" />
              {point}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
