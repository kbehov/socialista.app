import { cn } from '@/lib/utils'

export const STUDIO_COMPOSER_SURFACE_CLASS = cn(
  'border-black/10 bg-background shadow-none',
  'dark:border-white/12 dark:bg-background',
)

/** Circular send control for studio prompt composers. */
export const STUDIO_COMPOSER_SEND_BUTTON_CLASS = cn(
  'size-8 shrink-0 rounded-full border-0 bg-foreground text-background shadow-none',
  'hover:bg-foreground/90 hover:text-background',
  'disabled:pointer-events-none disabled:bg-foreground/50 disabled:text-background/75 disabled:opacity-100',
)

/** Attach (+) control — icon only, no chip background. */
export const STUDIO_ATTACH_PLUS_BUTTON_CLASS = cn(
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent px-0 shadow-none',
  'text-foreground hover:bg-transparent',
  'active:scale-[0.98] motion-reduce:active:scale-100',
  'disabled:opacity-40',
  '[&_svg]:size-4 [&_svg]:text-foreground/55',
  'hover:[&_svg]:text-foreground/85',
  'dark:hover:bg-transparent',
)

/** Lifted field on the studio home canvas — sits on the hero with a hairline and inner highlight. */
export const STUDIO_HOME_COMPOSER_SURFACE_CLASS = cn(
  'rounded-[1.75rem] border-black/[0.06] bg-[var(--surface-1)]',
  'shadow-[0_16px_40px_-20px_rgba(0,0,0,0.32),inset_0_1px_0_0_rgba(255,255,255,0.72)]',
  'dark:border-white/[0.09] dark:bg-[var(--surface-1)]',
  'dark:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.045)]',
  'has-[[data-slot=input-group-control]:focus-visible]:border-black/16',
  'has-[[data-slot=input-group-control]:focus-visible]:ring-1',
  'has-[[data-slot=input-group-control]:focus-visible]:ring-black/[0.05]',
  'dark:has-[[data-slot=input-group-control]:focus-visible]:border-white/16',
  'dark:has-[[data-slot=input-group-control]:focus-visible]:ring-white/[0.08]',
)

/** White card embedded in the gradient studio home hero banner. */
export const STUDIO_HERO_COMPOSER_SURFACE_CLASS = cn(
  'rounded-[1.75rem] border-0 bg-white',
  'shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2),0_2px_10px_-2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.95)]',
  'dark:bg-[var(--surface-1)]',
  'dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
  'has-[[data-slot=input-group-control]:focus-visible]:ring-1',
  'has-[[data-slot=input-group-control]:focus-visible]:ring-black/[0.06]',
  'dark:has-[[data-slot=input-group-control]:focus-visible]:ring-white/[0.1]',
)

/** Black CTA submit button for studio home hero composers. */
export const STUDIO_HERO_SUBMIT_CLASS = cn(
  'h-8 gap-1.5 rounded-xl border-0 bg-black px-3.5 text-[13px] font-medium tracking-[-0.015em] text-white shadow-none',
  'hover:bg-black/90 hover:text-white',
  'dark:bg-white dark:text-black dark:hover:bg-white/90',
)

/** Nested inside a parent composer shell (e.g. UGC scene tabs). */
export const STUDIO_NESTED_COMPOSER_SURFACE_CLASS = cn(
  'rounded-none border-0 bg-transparent shadow-none',
  'has-[[data-slot=input-group-control]:focus-visible]:border-transparent',
  'has-[[data-slot=input-group-control]:focus-visible]:ring-0',
)

/** Footer row when nested in a UGC / tabbed composer shell. */
export const STUDIO_EMBEDDED_COMPOSER_FOOTER_CLASS =
  'border-t border-border/35 bg-muted/8 px-3 pb-2.5 pt-1.5 sm:px-3.5'

/** Outer shell for UGC scene prompt (tabs + nested inputs). */
export const STUDIO_UGC_COMPOSER_SHELL_CLASS = cn(
  STUDIO_HOME_COMPOSER_SURFACE_CLASS,
  'overflow-hidden transition-[border-color,box-shadow] duration-200',
)

/** @deprecated Use STUDIO_HOME_COMPOSER_SURFACE_CLASS */
export const IMAGE_STUDIO_COMPOSER_SURFACE_CLASS = STUDIO_HOME_COMPOSER_SURFACE_CLASS

/** Borderless ghost chip for composer footer actions. */
export const STUDIO_TOOL_BUTTON_CLASS = cn(
  'inline-flex h-8 items-center gap-1 rounded-lg border-0 bg-transparent px-2 shadow-none',
  'text-[12px] font-medium leading-none tracking-[-0.015em] text-foreground/80',
  'hover:bg-black/[0.04] hover:text-foreground',
  'dark:hover:bg-white/[0.06]',
  'active:scale-[0.98] motion-reduce:active:scale-100',
  '[&_svg]:size-4 [&_svg]:text-foreground/45',
  '[&_img]:size-4 [&_img]:shrink-0 [&_img]:object-contain',
)

export const STUDIO_TOOL_BUTTON_ACTIVE_CLASS = cn(
  'bg-black/[0.05] text-foreground hover:bg-black/[0.06]',
  'dark:bg-white/[0.07] dark:hover:bg-white/[0.09]',
  '[&_svg]:text-foreground/70',
)

export const STUDIO_TOOL_ICON_BUTTON_CLASS = cn(
  STUDIO_TOOL_BUTTON_CLASS,
  'size-8 gap-0 px-0',
)

/** Max width for studio prompt composers (home hero and centered layouts). */
export const STUDIO_PROMPT_COMPOSER_MAX_WIDTH_CLASS = 'max-w-[48rem]'

export const STUDIO_TOOL_CHEVRON_CLASS = 'size-3.5! shrink-0 opacity-45'
