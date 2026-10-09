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
    rotate: "-rotate-[4deg]",
    offset: "translate-y-2 sm:translate-y-3",
    zIndex: "z-[1]",
    opacity: "opacity-90",
    delay: "0ms",
  },
  {
    width: "w-[6.25rem] sm:w-[7.5rem]",
    scale: "scale-100 sm:scale-[1.02]",
    rotate: "rotate-0",
    offset: "translate-y-0",
    zIndex: "z-[3]",
    opacity: "opacity-100",
    delay: "70ms",
  },
  {
    width: "w-[5.5rem] sm:w-[6.5rem]",
    scale: "scale-[0.92] sm:scale-[0.94]",
    rotate: "rotate-[3deg]",
    offset: "translate-y-1.5 sm:translate-y-2",
    zIndex: "z-[2]",
    opacity: "opacity-95",
    delay: "140ms",
  },
] as const;

const SCENE_VISUALS = {
  talking: {
    gradient:
      "from-[#f4d9c8] via-[#e8b89a] to-[#c9856a] dark:from-[#3d2a24] dark:via-[#5c3d32] dark:to-[#2a1814]",
  },
  "product-hold": {
    gradient:
      "from-[#dce8f0] via-[#b8cdd9] to-[#8aa8bc] dark:from-[#1e2a32] dark:via-[#2a3d4a] dark:to-[#152028]",
  },
  "b-roll": {
    gradient:
      "from-[#e8dfd4] via-[#cfc0ad] to-[#a89278] dark:from-[#2a2620] dark:via-[#3d352c] dark:to-[#1a1612]",
  },
} as const;

type StarterSceneType = keyof typeof SCENE_VISUALS;

const riseClass = "animate-empty-rise motion-reduce:animate-none";

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
        "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10",
        className,
      )}
    >
      <div className="flex w-full max-w-[28rem] flex-col items-center sm:max-w-[32rem]">
        <SceneStillRow />

        <div
          id="ugc-tour-workbench"
          className={cn("mt-8 flex w-full flex-col items-center text-center", riseClass)}
          style={{ animationDelay: "160ms" }}
        >
          <h2 className="text-balance text-[17px] font-medium tracking-tight text-foreground">
            Start with a scene
          </h2>
          <p className="mx-auto mt-1.5 max-w-[22rem] text-pretty text-[13px] leading-relaxed text-muted-foreground">
            Plan a video from a brief, use a 3-scene template, or add one
            talking shot.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {onPlan ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" onClick={onPlan}>
                    Plan new UGC video
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Answer a few questions — AI drafts scenes, script, and shots
                  for you.
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
                Ready-made hook → product → call-to-action sequence you can
                edit.
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
        </div>

        <HowItWorksStrip />
      </div>
    </div>
  );
}

function SceneStillRow() {
  return (
    <div
      className="relative flex w-full max-w-full items-end justify-center overflow-visible px-3 pt-3 pb-1 sm:px-4"
      aria-hidden
    >
      <span className="pointer-events-none absolute -bottom-1 left-1/2 h-2.5 w-36 -translate-x-1/2 rounded-full bg-foreground/[0.08] blur-md sm:w-44" />
      <div className="relative flex items-end justify-center">
        {(UGC_STARTER_SCENE_TYPES as StarterSceneType[]).map((type, index) => (
          <SceneStillCard
            key={type}
            type={type}
            index={index}
            layout={SCENE_CARD_LAYOUT[index] ?? SCENE_CARD_LAYOUT[1]}
          />
        ))}
      </div>
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
      className={cn("relative -mx-1 sm:-mx-1.5", layout.width, layout.zIndex, riseClass)}
      style={{ animationDelay: layout.delay }}
    >
      <div
        className={cn(
          "relative aspect-[9/16] origin-bottom overflow-hidden rounded-[var(--radius-lg)]",
          "shadow-[0_1px_1px_oklch(0_0_0/0.06),0_12px_28px_-14px_oklch(0_0_0/0.45)]",
          "outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
          layout.scale,
          layout.rotate,
          layout.offset,
          layout.opacity,
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br", visual.gradient)} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent dark:from-white/10" />

        <SceneStillArt type={type} />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-2 pt-8 pb-2">
          <p className="truncate text-[10px] font-medium tracking-tight text-white/95 sm:text-[11px]">
            {UGC_CLIP_TYPE_LABELS[type]}
          </p>
        </div>

        <span className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-full bg-white/75 text-[10px] font-medium text-foreground/80 tabular-nums shadow-[inset_0_1px_0_oklch(1_0_0/0.65)] backdrop-blur-md dark:bg-black/35 dark:text-white dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.16)]">
          {index + 1}
        </span>
      </div>
    </div>
  );
}

function SceneStillArt({ type }: { type: UgcClipType }) {
  if (type === "talking") {
    return (
      <>
        <div className="absolute inset-x-[22%] top-[18%] aspect-square rounded-full bg-white/30 blur-[1px]" />
        <div className="absolute inset-x-[28%] top-[34%] h-[42%] rounded-t-[999px] bg-white/18" />
        <div className="absolute inset-x-[18%] bottom-[22%] h-[14%] rounded-full bg-black/10 blur-md" />
      </>
    );
  }

  if (type === "product-hold") {
    return (
      <>
        <div className="absolute inset-x-[24%] top-[28%] h-[34%] rounded-[var(--radius-md)] bg-white/40 shadow-[inset_0_1px_0_oklch(1_0_0/0.5)]" />
        <div className="absolute inset-x-[14%] bottom-[18%] h-[22%] rounded-t-[2.5rem] bg-white/22" />
        <div className="absolute inset-x-[30%] bottom-[24%] h-[8%] rounded-full bg-black/10" />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-x-[16%] top-[22%] h-[28%] rounded-[var(--radius-md)] bg-white/25" />
      <div className="absolute inset-x-[24%] top-[54%] h-[18%] rounded-full bg-white/20 blur-[0.5px]" />
      <div className="absolute inset-x-[20%] bottom-[20%] h-[12%] rounded-[var(--radius-md)] bg-black/10" />
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
    <ol
      className={cn(
        "relative mt-8 flex w-full max-w-[18rem] flex-col items-start gap-2.5 sm:mt-9 sm:grid sm:max-w-[26rem] sm:grid-cols-3 sm:items-start sm:gap-3",
        riseClass,
      )}
      style={{ animationDelay: "230ms" }}
    >
      <span
        aria-hidden
        className="absolute top-2.5 right-[16%] left-[16%] hidden h-px -translate-y-1/2 bg-border sm:block"
      />
      {HOW_IT_WORKS.map((step) => (
        <li
          key={step.n}
          className="flex items-center gap-2 sm:flex-col sm:gap-2 sm:text-center"
        >
          <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-medium text-foreground tabular-nums ring-1 ring-border">
            {step.n}
          </span>
          <span className="text-[12px] leading-snug text-muted-foreground">
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
