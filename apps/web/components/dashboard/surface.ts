/**
 * Dashboard surface tokens — single source of truth for list/overview pages.
 * Prefer these over one-off border/bg/radius classes so dark mode stays flat and scannable.
 *
 * Light borders stay soft; dark mode uses a mid-opacity border token — full strength reads
 * harsh, stacked /50 modifiers disappear on near-black surfaces.
 */
export const dashboardSurface = {
  border: 'border-border/55 dark:border-border/75',
  bg: 'bg-background',

  section: 'overflow-hidden rounded-lg border border-border/55 bg-background dark:border-border/80',
  sectionHeader: 'border-b border-border/45 dark:border-border/55',
  sectionTitle: 'text-[13px] font-medium tracking-tight text-foreground',
  sectionDescription: 'text-xs leading-relaxed text-muted-foreground',

  panel: 'rounded-lg border border-border/55 bg-background px-4 py-3 dark:border-border/80',
  tableShell: 'overflow-hidden rounded-lg border border-border/55 bg-background dark:border-border/80',
  tableHead: 'border-border/55 bg-muted/15 dark:border-border/60',

  segment:
    'inline-flex items-center gap-0.5 rounded-lg border border-border/55 bg-muted/20 p-0.5 dark:border-border/70 dark:bg-muted/15',
  segmentItem:
    'rounded-md text-[11px] font-medium transition-colors duration-150 active:scale-[0.97] motion-reduce:active:scale-100',
  segmentItemActive: 'bg-background text-foreground ring-1 ring-border/45 dark:ring-border/60',
  segmentItemInactive: 'text-muted-foreground hover:text-foreground',

  dividerGrid:
    'grid gap-px overflow-hidden rounded-lg border border-border/55 bg-border/30 dark:border-border/75 dark:bg-border/40',
  dividerCell: 'bg-background',

  inset: 'rounded-lg border border-border/45 bg-background dark:border-border/65',
  insetMuted: 'rounded-md bg-muted/25',
  insetDashed: 'rounded-lg border border-dashed border-border/55 bg-muted/10 dark:border-border/70',

  emptyHero: 'rounded-xl border border-border/55 bg-muted/10 dark:border-border/75',
  emptyIcon: 'size-10 rounded-lg border border-border/55 bg-background dark:border-border/75 [&_svg]:size-4',

  /** Primary page-header CTA — matches Posts / Accounts create actions */
  createCta:
    'h-9 rounded-full px-4 shadow-xs transition-all hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:scale-[0.98]',

  metricLabel: 'text-[11px] font-medium text-muted-foreground',
  metricValue: 'text-xl font-medium tracking-[-0.02em] tabular-nums text-foreground',
  metricValueSm: 'text-lg font-medium tracking-[-0.02em] tabular-nums text-foreground',
  metricMeta: 'text-[11px] leading-snug text-muted-foreground/80',
  metricDescription: 'truncate text-[11px] leading-snug text-muted-foreground/80',
} as const
