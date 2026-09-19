import { type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Duplicate tracks inside one sliding row (use 2 for seamless -50% loop)
   * @default 2
   */
  repeat?: number
  /**
   * When true, vertical overflow is visible so transformed children (e.g. arched marquees) are not clipped.
   */
  allowOverflow?: boolean
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 2,
  allowOverflow = false,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group p-2 [--duration:40s] [--gap:1rem]",
        allowOverflow ? "overflow-visible" : "overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max shrink-0",
          {
            "animate-marquee-landing flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
            "[animation-direction:reverse]": reverse,
          }
        )}
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={cn("flex shrink-0 justify-start gap-(--gap)", {
                "flex-row": !vertical,
                "flex-col": vertical,
              })}
            >
              {children}
            </div>
          ))}
      </div>
    </div>
  )
}
