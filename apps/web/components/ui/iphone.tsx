import { useId, type HTMLAttributes, type ReactNode } from "react"

import { cn } from "@/lib/utils"

const PHONE_WIDTH = 433
const PHONE_HEIGHT = 882

export const IPHONE_ASPECT_RATIO = `${PHONE_WIDTH}/${PHONE_HEIGHT}`

type BezelPreset = {
  screenX: number
  screenY: number
  screenWidth: number
  screenHeight: number
  screenRadius: number
}

const BEZEL_PRESETS = {
  default: {
    screenX: 21.25,
    screenY: 19.25,
    screenWidth: 389.5,
    screenHeight: 843.5,
    screenRadius: 55.75,
  },
  thin: {
    screenX: 18,
    screenY: 18,
    screenWidth: 397,
    screenHeight: 846,
    screenRadius: 53.5,
  },
} as const

type IphoneVariant = "default" | "black"
type IphoneBezel = "default" | "thin" | "minimal"

const VARIANT_COLORS: Record<
  IphoneVariant,
  {
    shell: string
    frame: string
    buttons: string
    screen: string
    antenna: string
    island: string
    islandLens: string
    islandCamera: string
  }
> = {
  default: {
    shell: "#E5E5E5",
    frame: "#FFFFFF",
    buttons: "#E5E5E5",
    screen: "#E5E5E5",
    antenna: "#E5E5E5",
    island: "#F5F5F5",
    islandLens: "#F5F5F5",
    islandCamera: "#E5E5E5",
  },
  black: {
    shell: "#050505",
    frame: "#0A0A0A",
    buttons: "#141414",
    screen: "#0A0A0A",
    antenna: "#1A1A1A",
    island: "#111111",
    islandLens: "#1A1A1A",
    islandCamera: "#2A2A2A",
  },
}

function getScreenMetrics(bezel: IphoneBezel) {
  const preset =
    bezel === "thin" || bezel === "minimal"
      ? BEZEL_PRESETS.thin
      : BEZEL_PRESETS.default

  const leftPct = (preset.screenX / PHONE_WIDTH) * 100
  const topPct = (preset.screenY / PHONE_HEIGHT) * 100
  const widthPct = (preset.screenWidth / PHONE_WIDTH) * 100
  const heightPct = (preset.screenHeight / PHONE_HEIGHT) * 100
  const radiusH = (preset.screenRadius / preset.screenWidth) * 100
  const radiusV = (preset.screenRadius / preset.screenHeight) * 100

  return { preset, leftPct, topPct, widthPct, heightPct, radiusH, radiusV }
}

export interface IphoneProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  videoSrc?: string
  variant?: IphoneVariant
  bezel?: IphoneBezel
  children?: ReactNode
}

export function Iphone({
  src,
  videoSrc,
  variant = "default",
  bezel = "default",
  className,
  style,
  children,
  ...props
}: IphoneProps) {
  const maskId = useId()
  const hasVideo = !!videoSrc
  const hasMedia = hasVideo || !!src
  const colors = VARIANT_COLORS[variant]
  const { preset, leftPct, topPct, widthPct, heightPct, radiusH, radiusV } =
    getScreenMetrics(bezel)
  const bezelRing = variant === "black" ? "#242424" : "#D4D4D4"

  return (
    <div
      className={cn("relative inline-block w-full align-middle leading-none", className)}
      style={{
        aspectRatio: IPHONE_ASPECT_RATIO,
        ...style,
      }}
      {...props}
    >
      {(hasVideo || src) && (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden bg-black"
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`,
            borderRadius: `${radiusH}% / ${radiusV}%`,
          }}
        >
          {src ? (
            <img
              src={src}
              alt=""
              className="absolute inset-0 size-full object-cover object-center"
            />
          ) : null}
          {hasVideo ? (
            <video
              className="absolute inset-0 size-full object-cover object-center"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : null}
        </div>
      )}

      {children ? (
        <div
          className="@container-size pointer-events-none absolute z-[1] overflow-hidden"
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`,
            borderRadius: `${radiusH}% / ${radiusV}%`,
          }}
        >
          {children}
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 size-full"
        style={{ transform: "translateZ(0)" }}
      >
        <g mask={hasMedia ? `url(#${maskId})` : undefined}>
          <path
            d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z"
            fill={colors.shell}
          />
          <path
            d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z"
            fill={colors.buttons}
          />
          <path
            d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z"
            fill={colors.buttons}
          />
          <path
            d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z"
            fill={colors.buttons}
          />
          <path
            d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z"
            fill={colors.buttons}
          />
          <path
            d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z"
            fill={colors.frame}
          />
        </g>

        <path
          opacity="0.5"
          d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
          fill={colors.antenna}
        />

        <path
          d={`M${preset.screenX} 75C${preset.screenX} 44.2101 46.2101 ${preset.screenY} 77 ${preset.screenY}H355C385.79 ${preset.screenY} 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 ${preset.screenX} 837.79 ${preset.screenX} 807V75Z`}
          fill={colors.screen}
          stroke={colors.screen}
          strokeWidth={0.35}
          mask={hasMedia ? `url(#${maskId})` : undefined}
        />

        <rect
          x={preset.screenX}
          y={preset.screenY}
          width={preset.screenWidth}
          height={preset.screenHeight}
          rx={preset.screenRadius}
          ry={preset.screenRadius}
          stroke={bezelRing}
          strokeWidth={1.15}
          fill="none"
        />

        <path
          d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
          fill={colors.island}
        />
        <path
          d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z"
          fill={colors.islandLens}
        />
        <path
          d="M254 48.5C254 45.4624 256.462 43 259.5 43C262.538 43 265 45.4624 265 48.5C265 51.5376 262.538 54 259.5 54C256.462 54 254 51.5376 254 48.5Z"
          fill={colors.islandCamera}
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
              x={preset.screenX}
              y={preset.screenY}
              width={preset.screenWidth}
              height={preset.screenHeight}
              rx={preset.screenRadius}
              ry={preset.screenRadius}
              fill="black"
            />
          </mask>
          <clipPath id="roundedCorners">
            <rect
              x={preset.screenX}
              y={preset.screenY}
              width={preset.screenWidth}
              height={preset.screenHeight}
              rx={preset.screenRadius}
              ry={preset.screenRadius}
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
