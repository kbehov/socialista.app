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
    <div className="mx-auto mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-full border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs font-normal tracking-[-0.01em] text-muted-foreground sm:gap-x-4 sm:px-4 sm:py-2 sm:text-[0.8125rem]">
      {HERO_PROOF_POINTS.map((point, index) => {
        const item = ITEMS[index];
        if (!item) return null;
        const Icon = item.icon;
        return (
          <span key={point} className="inline-flex items-center gap-1.5">
            <Icon
              className={`size-3 shrink-0 sm:size-3.5 ${item.iconClass}`}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{point}</span>
          </span>
        );
      })}
    </div>
  );
}
