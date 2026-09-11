import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type ShimmerButtonBaseProps = {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export type ShimmerButtonProps = ShimmerButtonBaseProps &
  (
    | (ComponentPropsWithoutRef<"button"> & { href?: undefined })
    | (Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string })
  )

function ShimmerButtonContent({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div
        className={cn(
          "-z-30 blur-[2px]",
          "@container-size absolute inset-0 overflow-visible"
        )}
      >
        <div className="animate-shimmer-slide absolute inset-0 aspect-square h-[100cqh] rounded-none [mask:none]">
          <div className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </div>
      </div>

      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-2xl shadow-[inset_0_-8px_10px_#ffffff1f]",
          "transform-gpu transition-all duration-300 ease-in-out",
          "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
          "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
        )}
      />

      <div
        className={cn(
          "absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
        )}
      />
    </>
  )
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      href,
      ...props
    },
    ref
  ) => {
    const style = {
      "--spread": "90deg",
      "--shimmer-color": shimmerColor,
      "--radius": borderRadius,
      "--speed": shimmerDuration,
      "--cut": shimmerSize,
      "--bg": background,
    } as CSSProperties

    const sharedClassName = cn(
      "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/10 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)]",
      "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
      className
    )

    if (href) {
      const { ...linkProps } = props as Omit<ComponentPropsWithoutRef<typeof Link>, "href">

      return (
        <Link
          href={href}
          className={sharedClassName}
          style={style}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...linkProps}
        >
          <ShimmerButtonContent>{children}</ShimmerButtonContent>
        </Link>
      )
    }

    const { ...buttonProps } = props as ComponentPropsWithoutRef<"button">

    return (
      <button
        type="button"
        className={sharedClassName}
        style={style}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...buttonProps}
      >
        <ShimmerButtonContent>{children}</ShimmerButtonContent>
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
