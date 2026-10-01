/**
 * Dashboard surface tokens — Linear-style: hairline borders, flat fills, no lift shadow.
 */
export const dashboardSurface = {
  border: 'border-border/60',
  bg: 'bg-background',

  section: 'overflow-hidden rounded-lg border border-border/60 bg-background shadow-none',
  sectionHeader: 'border-b border-border/50',
  sectionTitle: 'text-[13px] font-[510] tracking-tight text-foreground',
  sectionDescription: 'text-xs leading-relaxed text-muted-foreground',

  panel: 'rounded-lg border border-border/60 bg-background px-4 py-3 shadow-none',
  tableShell: 'overflow-hidden rounded-lg border border-border/60 bg-background shadow-none',
  tableHead: 'border-border/50 bg-muted/15',

  segment:
    'inline-flex items-center gap-0.5 rounded-[var(--control-radius)] border border-border/60 bg-muted/20 p-0.5 dark:bg-muted/15',
  segmentItem:
    'rounded-[var(--control-radius)] text-[11px] font-[510] transition-[color,background-color,transform] duration-150 ease-out active:scale-[var(--press-scale)] motion-reduce:active:scale-100',
  segmentItemActive: 'bg-foreground text-background',
  segmentItemInactive: 'text-muted-foreground hover:text-foreground',

  dividerGrid:
    'grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/40',
  dividerCell: 'bg-background',
  /** @alias dividerGrid */
  metricsGrid:
    'grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/40',
  /** @alias dividerCell */
  metricCell: 'bg-background',

  inset: 'rounded-lg border border-border/60 bg-muted/20 shadow-none',
  insetMuted: 'rounded-[var(--control-radius)] bg-muted/30',
  insetDashed: 'rounded-lg border border-dashed border-border/60 bg-muted/10 shadow-none',

  emptyHero: 'rounded-lg border border-border/60 bg-muted/10 shadow-none',
  emptyIcon: 'size-8 rounded-[var(--control-radius)] bg-muted/35 [&_svg]:size-3.5',

  createCta:
    'h-[var(--control-height)] rounded-[var(--control-radius)] px-3 text-[13px] font-[510] shadow-none transition-[color,background-color,transform] duration-150 ease-out active:scale-[var(--press-scale)] motion-reduce:active:scale-100',

  toolbarControl:
    'h-[var(--control-height)] rounded-[var(--control-radius)] border border-border/60 bg-background px-2.5 text-[12px] font-[510] shadow-none hover:bg-muted/60 hover:text-foreground active:scale-[var(--press-scale)] motion-reduce:active:scale-100',

  metricLabel: 'text-[11px] font-[510] text-muted-foreground',
  metricValue: 'text-xl font-[590] tracking-tight tabular-nums text-foreground',
  metricValueSm: 'text-base font-[590] tracking-tight tabular-nums text-foreground',
  metricMeta: 'text-[11px] leading-snug text-muted-foreground',
  metricDescription: 'truncate text-[11px] leading-snug text-muted-foreground',
  trendUp: 'text-success',
  trendDown: 'text-destructive',
} as const
