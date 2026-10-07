/**
 * Dashboard surface tokens — Linear-style: hairline borders, flat fills, no lift shadow.
 * Borders use the raw hairline (`border-border`). Fills are two steps: quiet `/20`, raised `/35`.
 */
export const dashboardSurface = {
  border: 'border-border',
  bg: 'bg-background',

  section: 'overflow-hidden rounded-lg border border-border bg-background shadow-none',
  sectionHeader: 'border-b border-border',
  sectionTitle: 'text-[13px] font-medium tracking-normal text-foreground',
  sectionDescription: 'text-xs leading-relaxed text-muted-foreground',

  panel: 'rounded-lg border border-border bg-background px-4 py-3 shadow-none',
  tableShell: 'overflow-hidden rounded-lg border border-border bg-background shadow-none',
  tableHead: 'border-border bg-foreground/5',

  segment:
    'inline-flex items-center gap-0.5 rounded-[var(--control-radius)] border border-border bg-foreground/5 p-0.5',
  segmentItem:
    'rounded-[var(--control-radius)] text-xs font-medium tracking-normal transition-[color,background-color,transform] duration-(--duration-normal) ease-out active:scale-[var(--press-scale)] motion-reduce:active:scale-100',
  segmentItemActive: 'bg-foreground text-background',
  segmentItemInactive: 'text-muted-foreground hover:text-foreground',

  dividerGrid: 'grid gap-px overflow-hidden rounded-lg border border-border bg-border',
  dividerCell: 'bg-background',
  /** @alias dividerGrid */
  metricsGrid: 'grid gap-px overflow-hidden rounded-lg border border-border bg-border',
  /** @alias dividerCell */
  metricCell: 'bg-background',

  inset: 'rounded-lg border border-border bg-muted/20 shadow-none',
  insetMuted: 'rounded-[var(--control-radius)] bg-muted/35',
  insetDashed: 'rounded-lg border border-dashed border-border bg-muted/20 shadow-none',

  emptyHero: 'rounded-lg border border-border bg-muted/20 shadow-none',
  emptyIcon: 'size-8 rounded-[var(--control-radius)] bg-muted/35 [&_svg]:size-3.5',

  createCta:
    'h-[var(--control-height-md)] rounded-[var(--control-radius)] px-3 text-[13px] font-medium tracking-normal shadow-none transition-[color,background-color,transform] duration-(--duration-normal) ease-out active:scale-[var(--press-scale)] motion-reduce:active:scale-100',

  toolbarControl:
    'h-[var(--control-height)] rounded-[var(--control-radius)] border border-border bg-background px-2.5 text-xs font-medium tracking-normal shadow-none transition-[color,background-color,transform] duration-(--duration-normal) ease-out hover:bg-accent hover:text-foreground active:scale-[var(--press-scale)] motion-reduce:active:scale-100',

  metricLabel: 'text-xs font-medium tracking-normal text-muted-foreground',
  metricValue: 'text-2xl font-semibold tracking-tight tabular-nums text-foreground',
  metricValueSm: 'text-base font-semibold tracking-normal tabular-nums text-foreground',
  metricMeta: 'text-xs leading-snug text-muted-foreground',
  metricDescription: 'truncate text-xs leading-snug text-muted-foreground',
  trendUp: 'text-success',
  trendDown: 'text-destructive',
} as const
