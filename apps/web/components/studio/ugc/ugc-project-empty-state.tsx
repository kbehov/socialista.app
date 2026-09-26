"use client";

import { UgcAddSceneMenu } from "@/components/studio/ugc/ugc-add-scene-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  UGC_CLIP_TYPE_LABELS,
  UGC_STARTER_SCENE_TYPES,
  type UgcClip,
  type UgcClipType,
} from "@socialista/types";

/** Swap when the official Socialista UGC studio walkthrough is published. */
const UGC_GUIDE_VIDEO_ID = "pRtkjKD38SM";

type UgcProjectEmptyStateProps = {
  clips: UgcClip[];
  creating?: boolean;
  onPlan?: () => void;
  onUseStarter: () => void;
  onAddClip: (type: UgcClipType) => void;
  className?: string;
};

const SCENE_CARD_LAYOUT = [
  {
    width: "w-[5.25rem] sm:w-[6.25rem]",
    scale: "scale-[0.88] sm:scale-[0.9]",
    rotate: "-rotate-[5deg]",
    offset: "translate-y-3 sm:translate-y-4",
    zIndex: "z-[1]",
    opacity: "opacity-90",
  },
  {
    width: "w-[6.25rem] sm:w-[7.5rem]",
    scale: "scale-100 sm:scale-105",
    rotate: "rotate-0",
    offset: "translate-y-0",
    zIndex: "z-[3]",
    opacity: "opacity-100",
  },
  {
    width: "w-[5.5rem] sm:w-[6.5rem]",
    scale: "scale-[0.92] sm:scale-[0.94]",
    rotate: "rotate-[4deg]",
    offset: "translate-y-2 sm:translate-y-3",
    zIndex: "z-[2]",
    opacity: "opacity-95",
  },
] as const;

const SCENE_VISUALS = {
  talking: {
    gradient:
      "from-[#f4d9c8] via-[#e8b89a] to-[#c9856a] dark:from-[#3d2a24] dark:via-[#5c3d32] dark:to-[#2a1814]",
    accent: "bg-[#f8ebe3]/80 dark:bg-white/10",
  },
  "product-hold": {
    gradient:
      "from-[#dce8f0] via-[#b8cdd9] to-[#8aa8bc] dark:from-[#1e2a32] dark:via-[#2a3d4a] dark:to-[#152028]",
    accent: "bg-[#eef4f8]/80 dark:bg-white/10",
  },
  "b-roll": {
    gradient:
      "from-[#e8dfd4] via-[#cfc0ad] to-[#a89278] dark:from-[#2a2620] dark:via-[#3d352c] dark:to-[#1a1612]",
    accent: "bg-[#f5f0ea]/80 dark:bg-white/10",
  },
} as const;

type StarterSceneType = keyof typeof SCENE_VISUALS;

export function UgcProjectEmptyState({
  clips,
  creating,
  onPlan,
  onUseStarter,
  onAddClip,
  className,
}: UgcProjectEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-10",
        className,
      )}
    >
      <div className="flex w-full max-w-[28rem] flex-col items-center sm:max-w-[32rem]">
        <SceneStillRow />

        <div id="ugc-tour-workbench" className="mt-8 text-center">
          <h2 className="text-[15px] font-medium tracking-[-0.01em] text-foreground">
            Start with a scene
          </h2>
          <p className="mx-auto mt-1.5 max-w-[20rem] text-[13px] leading-relaxed text-muted-foreground">
            Plan a video from a brief, use a 3-scene template, or add one
            talking shot.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {onPlan ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" onClick={onPlan}>
                  Plan new UGC video
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Answer a few questions — AI drafts scenes, script, and shots for
                you.
              </TooltipContent>
            </Tooltip>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant={onPlan ? "outline" : "default"}
                  disabled={creating}
                  onClick={onUseStarter}
                >
                  Use a 3-scene ad
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Ready-made hook → product → call-to-action sequence you can edit.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <UgcAddSceneMenu
                  clips={clips}
                  creating={creating}
                  align="center"
                  onAdd={onAddClip}
                >
                  <Button type="button" variant="outline" disabled={creating}>
                    Add a scene
                  </Button>
                </UgcAddSceneMenu>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Start from a single blank scene and build it manually.
            </TooltipContent>
          </Tooltip>
        </div>

        <HowItWorksStrip />

        <UgcGuideVideoSection />
      </div>
    </div>
  );
}

function SceneStillRow() {
  return (
    <div
      className="relative flex w-full items-end justify-center -space-x-3 sm:-space-x-4"
      style={{ perspective: "900px" }}
      aria-hidden
    >
      {(UGC_STARTER_SCENE_TYPES as StarterSceneType[]).map((type, index) => (
        <SceneStillCard
          key={type}
          type={type}
          index={index}
          layout={SCENE_CARD_LAYOUT[index] ?? SCENE_CARD_LAYOUT[1]}
        />
      ))}
    </div>
  );
}

function SceneStillCard({
  type,
  index,
  layout,
}: {
  type: StarterSceneType;
  index: number;
  layout: (typeof SCENE_CARD_LAYOUT)[number];
}) {
  const visual = SCENE_VISUALS[type];

  return (
    <div
      className={cn(
        "relative aspect-[9/16] shrink-0 origin-bottom overflow-hidden rounded-[0.9rem]",
        "shadow-[0_12px_32px_-14px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.08] dark:ring-white/[0.12]",
        "transition-transform duration-300 motion-reduce:transition-none",
        layout.width,
        layout.scale,
        layout.rotate,
        layout.offset,
        layout.zIndex,
        layout.opacity,
      )}
    >
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", visual.gradient)}
      />

      <SceneStillArt type={type} />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent px-2 pb-2 pt-8">
        <p className="truncate text-[10px] font-medium tracking-tight text-white/95 sm:text-[11px]">
          {UGC_CLIP_TYPE_LABELS[type]}
        </p>
      </div>

      <span
        className={cn(
          "absolute top-2 left-2 flex size-[1.125rem] items-center justify-center rounded-full text-[10px] font-medium tabular-nums text-foreground/80 backdrop-blur-sm sm:size-5 sm:text-[11px]",
          visual.accent,
        )}
      >
        {index + 1}
      </span>
    </div>
  );
}

function SceneStillArt({ type }: { type: UgcClipType }) {
  if (type === "talking") {
    return (
      <>
        <div className="absolute inset-x-[22%] top-[18%] aspect-square rounded-full bg-white/25 blur-[1px]" />
        <div className="absolute inset-x-[28%] top-[34%] h-[42%] rounded-t-[999px] bg-white/15" />
        <div className="absolute inset-x-[18%] bottom-[22%] h-[14%] rounded-full bg-black/10 blur-md" />
      </>
    );
  }

  if (type === "product-hold") {
    return (
      <>
        <div className="absolute inset-x-[24%] top-[28%] h-[34%] rounded-lg bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" />
        <div className="absolute inset-x-[14%] bottom-[18%] h-[22%] rounded-t-[2.5rem] bg-white/20" />
        <div className="absolute inset-x-[30%] bottom-[24%] h-[8%] rounded-full bg-black/10" />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-x-[16%] top-[22%] h-[28%] rounded-md bg-white/22" />
      <div className="absolute inset-x-[24%] top-[54%] h-[18%] rounded-full bg-white/18 blur-[0.5px]" />
      <div className="absolute inset-x-[20%] bottom-[20%] h-[12%] rounded-lg bg-black/10" />
    </>
  );
}

const HOW_IT_WORKS = [
  { n: "1", label: "Add scenes" },
  { n: "2", label: "Generate photo + voiceover" },
  { n: "3", label: "Animate & finish" },
] as const;

function HowItWorksStrip() {
  return (
    <ol className="mt-8 flex w-full max-w-[22rem] flex-col items-center gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-0">
      {HOW_IT_WORKS.map((step, index) => (
        <li key={step.n} className="flex items-center">
          {index > 0 ? (
            <span
              className="mx-2 hidden text-muted-foreground/40 sm:inline"
              aria-hidden
            >
              →
            </span>
          ) : null}
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="flex size-4 items-center justify-center rounded-full bg-muted text-[10px] font-medium tabular-nums text-foreground/80">
              {step.n}
            </span>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function UgcGuideVideoSection() {
  return (
    <section
      data-ugc-demo-video-slot
      className="mt-10 w-full border-t border-black/[0.06] pt-8 dark:border-white/[0.08]"
      aria-labelledby="ugc-guide-heading"
    >
      <div className="mb-4 text-center">
        <h3
          id="ugc-guide-heading"
          className="text-[14px] font-medium tracking-[-0.01em] text-foreground"
        >
          Learn how to make UGC videos
        </h3>
        <p className="mx-auto mt-1 max-w-[22rem] text-[12px] leading-relaxed text-muted-foreground">
          A quick walkthrough of planning scenes, generating stills, and
          stitching your ad together.
        </p>
      </div>

      <div className="relative mx-auto aspect-video w-full max-w-[min(100%,28rem)] overflow-hidden rounded-xl bg-muted ring-1 ring-black/[0.08] dark:ring-white/[0.1]">
        <iframe
          src={`https://www.youtube.com/embed/${UGC_GUIDE_VIDEO_ID}?rel=0&modestbranding=1`}
          title="How to create UGC videos in Socialista"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </section>
  );
}
