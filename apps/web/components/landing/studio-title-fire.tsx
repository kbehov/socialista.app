"use client";

import { cn } from "@/lib/utils";

type StudioTitleFireProps = {
  emoji: string;
  className?: string;
};

export function StudioTitleFire({ emoji, className }: StudioTitleFireProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block origin-bottom align-[-0.08em] motion-reduce:animate-none animate-fire-flicker",
        className,
      )}
    >
      {emoji}
    </span>
  );
}
