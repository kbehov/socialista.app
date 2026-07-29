/**
 * Dashboard surface tokens — single source of truth for list/overview pages.
 * Prefer these over one-off border/bg/radius classes so dark mode stays flat and scannable.
 */
export const dashboardSurface = {
  border: 'border-border/60',
  bg: 'bg-background',

  section: 'overflow-hidden rounded-xl border border-border/60 bg-background shadow-xs',
  sectionHeader: 'border-b border-border/40',
  sectionTitle: 'text-[13px] font-semibold tracking-tight text-foreground',
  sectionDescription: 'text-xs leading-relaxed text-muted-foreground',

  panel: 'rounded-xl border border-border/60 bg-background px-4 py-3',
  tableShell: 'overflow-hidden rounded-xl border border-border/60 bg-background shadow-xs',
  tableHead: 'border-border/60 bg-muted/20',

  segment: 'inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/35 p-0.5 dark:bg-muted/25',
  segmentItem:
    'rounded-full text-[11px] font-medium transition-colors duration-150 active:scale-[0.97] motion-reduce:active:scale-100',
  segmentItemActive: 'bg-background text-foreground shadow-xs ring-1 ring-border/40',
  segmentItemInactive: 'text-muted-foreground hover:text-foreground',

  dividerGrid: 'grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40',
  dividerCell: 'bg-background',

  inset: 'rounded-xl border border-border/50 bg-background',
  insetMuted: 'rounded-lg bg-muted/40',
  insetDashed: 'rounded-xl border border-dashed border-border/60 bg-muted/15',

  emptyHero:
    'rounded-2xl border border-border/60 bg-gradient-to-b from-muted/20 via-muted/10 to-transparent',
  emptyIcon: 'size-12 rounded-2xl border border-border/60 bg-background shadow-xs [&_svg]:size-5',

  metricLabel: 'text-[11px] font-medium tracking-tight text-muted-foreground',
  metricValue: 'text-xl font-semibold tracking-[-0.02em] tabular-nums text-foreground',
  metricValueSm: 'text-lg font-semibold tracking-[-0.02em] tabular-nums text-foreground',
  metricMeta: 'text-[11px] leading-snug text-muted-foreground',
  metricDescription: 'truncate text-[11px] leading-snug text-muted-foreground',
} as const
