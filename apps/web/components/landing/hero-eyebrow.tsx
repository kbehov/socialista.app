import { ShieldCheck, Timer, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { HERO_PROOF_POINTS } from "./content";

const ITEMS: { icon: LucideIcon; iconClass: string }[] = [
  { icon: Zap, iconClass: "text-amber-500" },
  { icon: Timer, iconClass: "text-sky-500" },
  { icon: ShieldCheck, iconClass: "text-emerald-500" },
];

export function HeroEyebrow() {
  return (
    <ul className="mx-auto flex max-w-full items-center justify-center rounded-full border border-border/70 bg-background/70 px-0.5 py-0.5 text-[0.6875rem] font-medium tracking-[-0.01em] text-muted-foreground sm:px-1.5 sm:py-1 sm:text-[0.8125rem]">
      {HERO_PROOF_POINTS.map((point, index) => {
        const item = ITEMS[index];
        if (!item) return null;
        const Icon = item.icon;
        return (
          <li key={point} className="flex items-center">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className="mx-1 h-2.5 w-px bg-border sm:mx-2 sm:h-3"
              />
            ) : null}
            <span className="inline-flex items-center gap-1 px-1.5 py-1 sm:gap-1.5 sm:px-2.5">
              <Icon
                className={`size-3 shrink-0 sm:size-3.5 ${item.iconClass}`}
                strokeWidth={2}
                aria-hidden="true"
              />
              {point}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
