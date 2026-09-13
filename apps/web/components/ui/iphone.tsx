"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

const PHONE_WIDTH = 433;
const PHONE_HEIGHT = 882;

const BEZEL_PRESETS = {
  default: {
    screenX: 21.25,
    screenY: 19.25,
    screenWidth: 389.5,
    screenHeight: 843.5,
    screenRadius: 55.75,
    innerBezelPath:
      "M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z",
  },
  thin: {
    screenX: 14,
    screenY: 13,
    screenWidth: 405,
    screenHeight: 856,
    screenRadius: 52,
    innerBezelPath:
      "M4 72C4 33.6832 35.6832 2 74 2H359C399.317 2 429 33.6832 429 72V810C429 849.317 399.317 882 359 882H74C35.6832 882 4 849.317 4 810V72Z",
  },
  minimal: {
    screenX: 2,
    screenY: 2,
    screenWidth: 429,
    screenHeight: 878,
    screenRadius: 58,
    innerBezelPath: "",
  },
} as const;

function getScreenStyle(preset: (typeof BEZEL_PRESETS)[keyof typeof BEZEL_PRESETS]) {
  const radiusH = (preset.screenRadius / preset.screenWidth) * 100;
  const radiusV = (preset.screenRadius / preset.screenHeight) * 100;

  return {
    left: `${(preset.screenX / PHONE_WIDTH) * 100}%`,
    top: `${(preset.screenY / PHONE_HEIGHT) * 100}%`,
    width: `${(preset.screenWidth / PHONE_WIDTH) * 100}%`,
    height: `${(preset.screenHeight / PHONE_HEIGHT) * 100}%`,
    borderRadius: `${radiusH}% / ${radiusV}%`,
  };
}

export const IPHONE_ASPECT_RATIO = `${PHONE_WIDTH}/${PHONE_HEIGHT}`;

export interface IphoneProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  videoSrc?: string;
  children?: ReactNode;
  instanceId?: string;
  variant?: "default" | "black";
  bezel?: keyof typeof BEZEL_PRESETS;
}

function MinimalDynamicIsland({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="relative mt-[2.1%] h-[5.8%] w-[30%] min-h-[1.05rem] min-w-[3.75rem] rounded-full bg-black shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]"
      >
        <span
          className="absolute top-1/2 right-[11%] size-[30%] -translate-y-1/2 rounded-full bg-[#1c1c1c] ring-1 ring-[#333]"
        />
      </div>
    </div>
  );
}

const FRAME_VARIANTS = {
  default: {
    shell: "fill-[#E5E5E5] dark:fill-[#404040]",
    bezel: "fill-white dark:fill-[#262626]",
    accent: "fill-[#F5F5F5] dark:fill-[#262626]",
    detail: "fill-[#E5E5E5] dark:fill-[#404040]",
    screenStroke: "fill-[#E5E5E5] stroke-[#E5E5E5] dark:fill-[#404040] dark:stroke-[#404040]",
  },
  black: {
    shell: "fill-black",
    bezel: "fill-black",
    accent: "fill-[#1a1a1a]",
    detail: "fill-[#262626]",
    screenStroke: "fill-black stroke-[#1a1a1a]",
  },
} as const;

export function Iphone({
  src,
  videoSrc,
  children,
  instanceId,
  variant = "default",
  bezel = "default",
  className,
  style,
  ...props
}: IphoneProps) {
  const colors = FRAME_VARIANTS[variant];
  const bezelPreset = BEZEL_PRESETS[bezel];
  const screenStyle = getScreenStyle(bezelPreset);
  const hasVideo = !!videoSrc;
  const hasCustomScreen = Boolean(children);
  const hasMedia = hasVideo || !!src || hasCustomScreen;
  const isMinimal = bezel === "minimal";
  const maskId = instanceId ? `screenPunch-${instanceId}` : "screenPunch";
  const maskRef = `url(#${maskId})`;

  return (
    <div
      className={cn(
        "relative inline-block w-full align-middle leading-none",
        isMinimal && "overflow-hidden rounded-[2.35rem]",
        className,
      )}
      style={{
        aspectRatio: IPHONE_ASPECT_RATIO,
        ...style,
      }}
      {...props}
    >
      {hasCustomScreen ? (
        <div
          className={cn(
            "absolute z-0 overflow-hidden",
            isMinimal && "inset-0 rounded-[2.35rem]",
          )}
          style={isMinimal ? undefined : screenStyle}
        >
          {children}
        </div>
      ) : null}

      {hasVideo && !hasCustomScreen ? (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={screenStyle}
        >
          <video
            className="block size-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>
      ) : null}

      {!hasVideo && !hasCustomScreen && src ? (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={screenStyle}
        >
          <img
            src={src}
            alt=""
            className="block size-full object-cover object-top"
          />
        </div>
      ) : null}

      {isMinimal ? <MinimalDynamicIsland /> : null}

      {isMinimal ? null : (
      <svg
        viewBox={`0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 z-10 size-full"
        style={{ transform: "translateZ(0)" }}
        aria-hidden="true"
      >
        <g mask={hasMedia ? maskRef : undefined}>
          <path
            d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z"
            className={colors.shell}
          />
          <path
            d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z"
            className={colors.shell}
          />
          <path
            d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z"
            className={colors.shell}
          />
          <path
            d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z"
            className={colors.shell}
          />
          <path
            d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z"
            className={colors.shell}
          />
          <path d={bezelPreset.innerBezelPath} className={colors.bezel} />
        </g>

        <path
          opacity="0.5"
          d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
          className={colors.detail}
        />

        <path
          d={`M${bezelPreset.screenX} 75C${bezelPreset.screenX} 44.2101 46.2101 ${bezelPreset.screenY} 77 ${bezelPreset.screenY}H355C385.79 ${bezelPreset.screenY} 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 ${bezelPreset.screenX} 837.79 ${bezelPreset.screenX} 807V75Z`}
          className={cn(colors.screenStroke, "stroke-[0.25]")}
          mask={hasMedia ? maskRef : undefined}
        />

        <path
          d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
          className={colors.accent}
        />
        <path
          d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z"
          className={colors.accent}
        />
        <path
          d="M254 48.5C254 45.4624 256.462 43 259.5 43C262.538 43 265 45.4624 265 48.5C265 51.5376 262.538 54 259.5 54C256.462 54 254 51.5376 254 48.5Z"
          className={colors.detail}
        />

        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect
              x="0"
              y="0"
              width={PHONE_WIDTH}
              height={PHONE_HEIGHT}
              fill="white"
            />
            <rect
              x={bezelPreset.screenX}
              y={bezelPreset.screenY}
              width={bezelPreset.screenWidth}
              height={bezelPreset.screenHeight}
              rx={bezelPreset.screenRadius}
              ry={bezelPreset.screenRadius}
              fill="black"
            />
          </mask>
        </defs>
      </svg>
      )}
    </div>
  );
}
