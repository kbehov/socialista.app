/**
 * Dashboard surface tokens — single source of truth for list/overview pages.
 * Use `border-border/60` + `bg-background` so dark mode stays flat and scannable.
 */
export const dashboardSurface = {
  border: 'border-border/60',
  bg: 'bg-background',

  section: 'overflow-hidden rounded-xl border border-border/60 bg-background shadow-xs',
  sectionHeader: 'border-b border-border/40',
  sectionTitle: 'text-[13px] font-medium tracking-tight text-foreground',
  sectionDescription: 'text-xs leading-relaxed text-muted-foreground/80',

  panel: 'rounded-xl border border-border/60 bg-background px-4 py-3',
  tableShell: 'overflow-hidden rounded-xl border border-border/60 bg-background shadow-xs',
  tableHead: 'border-border/60 bg-muted/20',

  segment: 'inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5',
  segmentItem: 'rounded-md font-medium transition-colors',
  segmentItemActive: 'bg-background text-foreground shadow-xs',
  segmentItemInactive: 'text-muted-foreground hover:text-foreground',

  dividerGrid: 'grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60',
  dividerCell: 'bg-background',

  inset: 'rounded-lg border border-border/60',
  insetDashed: 'rounded-lg border border-dashed border-border/60 bg-muted/15',

  emptyHero:
    'rounded-2xl border border-border/60 bg-gradient-to-b from-muted/20 via-muted/10 to-transparent',

  emptyIcon: 'size-12 rounded-2xl border border-border/60 bg-background shadow-xs [&_svg]:size-5',

  metricLabel: 'text-[11px] font-medium tracking-wide text-muted-foreground uppercase',
  metricValue: 'text-xl font-semibold tracking-tight tabular-nums text-foreground',
  metricValueSm: 'text-lg font-semibold tracking-tight tabular-nums text-foreground',
  metricDescription: 'truncate text-[11px] text-muted-foreground/80',
} as const
