import { cn } from '@/lib/utils'

export const STUDIO_COMPOSER_SURFACE_CLASS = cn(
  'border-black/10 bg-background shadow-none',
  'dark:border-white/12 dark:bg-background',
)

/** Lifted field on the studio home canvas — sits on the hero with a hairline and inner highlight. */
export const STUDIO_HOME_COMPOSER_SURFACE_CLASS = cn(
  'rounded-xl border-black/[0.08] bg-[var(--surface-1)]',
  'shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.62)]',
  'dark:border-white/[0.09] dark:bg-[var(--surface-1)]',
  'dark:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.045)]',
  'has-[[data-slot=input-group-control]:focus-visible]:border-black/16',
  'has-[[data-slot=input-group-control]:focus-visible]:ring-1',
  'has-[[data-slot=input-group-control]:focus-visible]:ring-black/[0.05]',
  'dark:has-[[data-slot=input-group-control]:focus-visible]:border-white/16',
  'dark:has-[[data-slot=input-group-control]:focus-visible]:ring-white/[0.08]',
)

/** @deprecated Use STUDIO_HOME_COMPOSER_SURFACE_CLASS */
export const IMAGE_STUDIO_COMPOSER_SURFACE_CLASS = STUDIO_HOME_COMPOSER_SURFACE_CLASS

/** Borderless ghost chip for composer footer actions. */
export const STUDIO_TOOL_BUTTON_CLASS = cn(
  'h-6 gap-1 rounded-md border-0 bg-transparent px-1.5 shadow-none',
  'text-[12px] font-medium leading-none tracking-[-0.015em] text-foreground/80',
  'hover:bg-black/[0.04] hover:text-foreground',
  'dark:hover:bg-white/[0.06]',
  'active:scale-[0.98] motion-reduce:active:scale-100',
  '[&_svg]:size-3.5 [&_svg]:text-foreground/45',
)

export const STUDIO_TOOL_BUTTON_ACTIVE_CLASS = cn(
  'bg-black/[0.05] text-foreground hover:bg-black/[0.06]',
  'dark:bg-white/[0.07] dark:hover:bg-white/[0.09]',
  '[&_svg]:text-foreground/70',
)

export const STUDIO_TOOL_CHEVRON_CLASS = 'size-3! shrink-0 opacity-45'
