"use client";

import { cn } from "@/lib/utils";
import { getAspectRatioClass } from "@/utils/aspect-ratio";
import type { UgcClipVideoTake } from "@socialista/types";
import { CheckIcon, PlayIcon } from "lucide-react";
import Image from "next/image";

type UgcVideoTakesProps = {
  takes: UgcClipVideoTake[];
  selectedUrl?: string;
  disabled?: boolean;
  aspectRatio?: string;
  onSelect?: (url: string) => void;
};

export function UgcVideoTakes({
  takes,
  selectedUrl,
  disabled,
  aspectRatio = "9:16",
  onSelect,
}: UgcVideoTakesProps) {
  if (takes.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-center text-[12px] text-muted-foreground">
        {takes.length === 1 ? "1 version" : `${takes.length} versions`}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {takes.map((take, index) => {
          const active = take.videoUrl === selectedUrl;
          return (
            <button
              key={take.id}
              type="button"
              disabled={disabled || !onSelect}
              aria-pressed={active}
              aria-label={
                active
                  ? "Selected version"
                  : index === 0
                    ? "Use latest version"
                    : `Use version ${takes.length - index}`
              }
              onClick={() => onSelect?.(take.videoUrl)}
              className={cn(
                "group relative h-24 overflow-hidden rounded-lg bg-muted/40 transition-shadow",
                getAspectRatioClass(aspectRatio),
                "active:scale-[0.97] motion-reduce:active:scale-100",
                active
                  ? "ring-2 ring-foreground/80"
                  : "ring-1 ring-black/[0.06] hover:ring-black/25 dark:ring-white/[0.08] dark:hover:ring-white/25",
                (disabled || !onSelect) && "cursor-default",
              )}
            >
              {take.thumbnailUrl ? (
                <Image
                  alt=""
                  src={take.thumbnailUrl}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              ) : (
                <video
                  src={take.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 size-full object-cover"
                />
              )}

              {active ? (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-background">
                  <CheckIcon className="size-2.5" strokeWidth={2.5} />
                </span>
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                  <PlayIcon className="size-3.5 fill-white text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              )}

              {index === 0 && !active ? (
                <span className="absolute bottom-1 left-1 rounded-full bg-black/55 px-1.5 py-px text-[9px] font-medium text-white">
                  Latest
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
