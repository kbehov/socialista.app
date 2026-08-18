'use client'

import { cn } from '@/lib/utils'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

type UgcFlowStepProps = {
  title: string
  description?: string
  done?: boolean
  defaultOpen?: boolean
  actions?: ReactNode
  children?: ReactNode
}

export function UgcFlowStep({
  title,
  description,
  done,
  defaultOpen = true,
  actions,
  children,
}: UgcFlowStepProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-border/40 bg-background/70 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-xl">
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          aria-expanded={open}
        >
          <span
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
              done ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
            )}
          >
            {done ? <CheckIcon className="size-3" strokeWidth={2.5} /> : (
              <span className="size-1.5 rounded-full bg-current" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold tracking-tight">{title}</span>
            {description ? (
              <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground">
                {description}
              </span>
            ) : null}
          </span>
          <ChevronDownIcon
            className={cn(
              'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
        {actions}
      </div>
      {open && children ? <div className="border-t border-border/30 px-4 py-4">{children}</div> : null}
    </section>
  )
}
