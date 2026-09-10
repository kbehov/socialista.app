'use client'

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { commitHaptic } from "@/utils/haptics"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl border border-border/60 bg-card py-(--card-spacing) text-sm text-card-foreground shadow-xs [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-normal font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

type PresetCardProps = {
  title: string
  description: string
  image?: string
  imagePosition?: string
  previewClassName?: string
  onSelect?: () => void
  className?: string
}

function PresetCard({
  title,
  description,
  image,
  imagePosition,
  previewClassName,
  onSelect,
  className,
}: PresetCardProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect?.()
        commitHaptic({ vibrateDuration: 8 })
      }}
      className={cn(
        "group flex w-[7.25rem] shrink-0 flex-col text-left sm:w-[7.75rem]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <div
        className={cn(
          "relative aspect-[4/5] w-full overflow-hidden rounded-xl",
          "ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-200",
          "group-hover:shadow-[0_6px_18px_-8px_rgba(0,0,0,0.18)]",
          "group-active:scale-[0.98] motion-reduce:group-active:scale-100",
          "dark:ring-white/[0.08]",
          previewClassName
        )}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="124px"
            className={cn("select-none object-cover", imagePosition)}
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.28)_100%)]"
        />
      </div>
      <p className="mt-2 text-[12px] font-medium leading-[1.25] tracking-[-0.02em] text-foreground">
        {title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-[1.35] tracking-[-0.01em] text-black/44 dark:text-white/44">
        {description}
      </p>
    </button>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  PresetCard,
}
export type { PresetCardProps }
