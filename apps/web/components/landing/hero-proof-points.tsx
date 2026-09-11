import { Check } from 'lucide-react'

import { HERO_PROOF_POINTS } from './content'

export function HeroProofPoints() {
  return (
    <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
      {HERO_PROOF_POINTS.map(point => (
        <li key={point} className="inline-flex items-center gap-2">
          <span
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400"
            aria-hidden="true"
          >
            <Check className="size-2.5" strokeWidth={2.75} />
          </span>
          <span className="text-[0.6875rem] font-normal tracking-[-0.02em] text-muted-foreground sm:text-xs">
            {point}
          </span>
        </li>
      ))}
    </ul>
  )
}
