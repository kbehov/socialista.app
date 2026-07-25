'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimezoneSelector } from '@/components/ui/timezone-selector'
import { formatTimezoneDetail } from '@/lib/timezone'
import { cn } from '@/lib/utils'
import type { ComposerLayout } from '@/types/composer-types'
import { CalendarClockIcon, SendIcon } from 'lucide-react'
import { useId, useMemo } from 'react'

import type { ComposerSchedule, ComposerScheduleMode } from '../../../types/composer-types'
import { getDefaultScheduleFields } from '../../../utils/composer.utils'
import { ComposerSection } from './composer-section'

type SchedulePanelProps = {
  schedule: ComposerSchedule
  onChange: (patch: Partial<ComposerSchedule>) => void
  className?: string
  layout?: ComposerLayout
}

const MODE_OPTIONS: Array<{
  value: Extract<ComposerScheduleMode, 'now' | 'schedule'>
  label: string
  shortLabel: string
  Icon: typeof SendIcon
}> = [
  {
    value: 'now',
    label: 'Publish now',
    shortLabel: 'Now',
    Icon: SendIcon,
  },
  {
    value: 'schedule',
    label: 'Schedule',
    shortLabel: 'Later',
    Icon: CalendarClockIcon,
  },
]

const dateTimeInputClassName =
  'h-9 w-full min-w-0 rounded-xl border-border/50 bg-background text-sm shadow-none [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-datetime-edit]:min-w-0'

export function SchedulePanel({ schedule, onChange, className, layout = 'default' }: SchedulePanelProps) {
  const fieldId = useId()
  const isSheet = layout === 'sheet'
  const now = useMemo(() => new Date(), [])
  const defaultSchedule = useMemo(() => getDefaultScheduleFields(now), [now])
  const mode = schedule.mode === 'draft' ? 'schedule' : schedule.mode
  const scheduleDate: Date = schedule.date ?? defaultSchedule.date
  const scheduleTime: string = schedule.time ?? defaultSchedule.time

  return (
    <ComposerSection
      title="When to post"
      description={
        mode === 'now' ? 'Your post will be queued for immediate publishing.' : 'Pick a date, time, and timezone.'
      }
      compact
      className={className}
      contentClassName={cn('space-y-4 pt-0', isSheet && 'px-3 pb-3')}
    >
      <div
        className={cn(
          'rounded-full border border-border/50 bg-background p-0.5',
          isSheet ? 'flex w-full' : 'inline-flex',
        )}
      >
        {MODE_OPTIONS.map(option => {
          const selected = mode === option.value
          const Icon = option.Icon
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (option.value === 'schedule') {
                  onChange({ mode: 'schedule', ...getDefaultScheduleFields() })
                  return
                }
                onChange({ mode: option.value })
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-all duration-150',
                isSheet ? 'min-w-0 flex-1 px-2' : 'px-3.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'active:scale-[0.98]',
                selected
                  ? 'bg-background text-foreground shadow-xs ring-1 ring-border/40'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className={cn('truncate', isSheet ? 'text-[11px]' : 'hidden sm:inline')}>{option.label}</span>
              {!isSheet ? <span className="truncate sm:hidden">{option.shortLabel}</span> : null}
            </button>
          )
        })}
      </div>

      {mode === 'schedule' ? (
        <div className={cn('space-y-3 rounded-lg border border-border/40 bg-background', isSheet ? 'p-3' : 'space-y-4 p-4')}>
          <div
            className={cn(
              'gap-3',
              isSheet ? 'grid grid-cols-1' : 'flex flex-col gap-4 lg:flex-row lg:items-start',
            )}
          >
            <div
              className={cn(
                'min-w-0',
                isSheet ? 'grid grid-cols-2 gap-3' : 'flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end',
              )}
            >
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor={`${fieldId}-date`} className="text-[11px] font-medium text-muted-foreground">
                  Date
                </Label>
                <Input
                  id={`${fieldId}-date`}
                  type="date"
                  value={`${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={event => {
                    const value = event.target.value
                    if (!value) {
                      onChange({ date: defaultSchedule.date })
                      return
                    }
                    const [year, month, day] = value.split('-').map(Number)
                    if (year && month && day) {
                      onChange({ date: new Date(year, month - 1, day) })
                    }
                  }}
                  className={dateTimeInputClassName}
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label htmlFor={`${fieldId}-time`} className="text-[11px] font-medium text-muted-foreground">
                  Time
                </Label>
                <Input
                  id={`${fieldId}-time`}
                  type="time"
                  value={scheduleTime}
                  onChange={event => onChange({ time: event.target.value })}
                  className={dateTimeInputClassName}
                />
              </div>
            </div>

            <div className={cn('min-w-0 space-y-1.5', !isSheet && 'lg:max-w-xs lg:flex-none')}>
              <Label className="text-[11px] font-medium text-muted-foreground">Timezone</Label>
              <TimezoneSelector
                value={schedule.timezone}
                onChange={timezone => onChange({ timezone })}
                mode="popover"
                popoverWidth={isSheet ? 'trigger' : 'default'}
              />
            </div>
          </div>

          {schedule.timezone ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {formatTimezoneDetail(schedule.timezone, now)}
            </p>
          ) : null}
        </div>
      ) : null}
    </ComposerSection>
  )
}
