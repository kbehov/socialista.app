import { SkillUsageSparkline } from '@/components/skills/skill-usage-sparkline'
import { maxSkillUsage, type SkillListItem } from '@/lib/skills/skill-list'
import { cn } from '@/lib/utils'
import { formatCount } from '@/utils/format'
import { PROMPT_KEY_LABELS } from '@socialista/types'
import Link from 'next/link'
import type { ReactNode } from 'react'

const headClassName =
  'py-1.5 text-[10px] font-medium tracking-[0.06em] text-muted-foreground/55 uppercase select-none'

function tableColumns(hasActions: boolean) {
  return cn(
    'grid w-full min-w-0 items-center gap-x-2 sm:gap-x-3',
    hasActions
      ? 'grid-cols-[1.25rem_minmax(0,1fr)_auto_1.75rem] lg:grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,8rem)_3.5rem_auto_1.75rem]'
      : 'grid-cols-[1.25rem_minmax(0,1fr)_auto] lg:grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,8rem)_3.5rem_auto]',
  )
}

type SkillsTableProps = {
  skills: SkillListItem[]
  rowHref?: (skill: SkillListItem) => string
  renderActions?: (skill: SkillListItem) => ReactNode
}

export function SkillsTable({ skills, rowHref, renderActions }: SkillsTableProps) {
  const maxUsage = maxSkillUsage(skills)
  const columns = tableColumns(Boolean(renderActions))
  const hasActions = Boolean(renderActions)

  return (
    <div className="relative min-w-0 w-full">
      <div
        className={cn(
          columns,
          'sticky top-0 z-[1] border-b border-border/50 bg-background/90 pb-1 backdrop-blur-sm supports-[backdrop-filter]:bg-background/75',
        )}
      >
        <div className={headClassName}>#</div>
        <div className={headClassName}>Skill</div>
        <div className={cn(headClassName, 'hidden lg:block')}>Overrides</div>
        <div className={cn(headClassName, 'hidden lg:block')}>Usage</div>
        <div className={cn(headClassName, 'text-right')}>Uses</div>
        {hasActions ? <div className="py-1.5" aria-hidden /> : null}
      </div>

      <ul role="list" className="mt-0.5">
        {skills.map((skill, index) => {
          const href = rowHref?.(skill)
          const targetLabel = PROMPT_KEY_LABELS[skill.target]

          return (
            <li
              key={skill._id}
              className={cn(
                columns,
                'group relative rounded-md transition-colors duration-150',
                '[content-visibility:auto] [contain-intrinsic-size:0_44px]',
                'hover:bg-muted/25 focus-within:bg-muted/25',
              )}
            >
              <span className="py-2 text-[11px] tabular-nums text-muted-foreground/50">{index + 1}</span>

              <div className="min-w-0 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  {skill.icon ? (
                    <span className="shrink-0 text-[15px] leading-none" aria-hidden>
                      {skill.icon}
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-foreground">
                      {skill.name}
                    </span>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70 lg:hidden">
                      {targetLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden min-w-0 py-2 lg:flex lg:items-center">
                <span className="truncate text-[11px] text-muted-foreground/80">{targetLabel}</span>
              </div>

              <div className="hidden min-w-0 py-2 lg:flex lg:justify-start">
                <SkillUsageSparkline value={skill.usageCount} max={maxUsage} className="max-w-full" />
              </div>

              <div className="flex items-center justify-end py-2 text-[12px] tabular-nums text-muted-foreground">
                <span className="group-hover:text-foreground" title={skill.usageCount.toLocaleString('en-US')}>
                  {formatCount(skill.usageCount)}
                </span>
              </div>

              {renderActions ? (
                <div className="relative z-10 flex items-center justify-end py-1.5">{renderActions(skill)}</div>
              ) : null}

              {href ? (
                <Link
                  href={href}
                  className="absolute inset-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/25"
                  aria-label={`Open ${skill.name}`}
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
