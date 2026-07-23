'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimezoneSelector } from '@/components/ui/timezone-selector'
import { formatTimezoneDetail } from '@/lib/timezone'
import { cn } from '@/lib/utils'
import { CalendarClockIcon, SendIcon } from 'lucide-react'
import { useMemo } from 'react'

import { ComposerSection } from './composer-section'
import type { ComposerSchedule, ComposerScheduleMode } from './composer-types'

type SchedulePanelProps = {
  schedule: ComposerSchedule
  onChange: (patch: Partial<ComposerSchedule>) => void
  className?: string
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

export function SchedulePanel({ schedule, onChange, className }: SchedulePanelProps) {
  const now = useMemo(() => new Date(), [])
  const mode = schedule.mode === 'draft' ? 'schedule' : schedule.mode

  return (
    <ComposerSection
      title="When to post"
      description={
        mode === 'now'
          ? 'Your post will be queued for immediate publishing.'
          : 'Pick a date, time, and timezone.'
      }
      compact
      className={className}
      contentClassName="space-y-4 pt-0"
    >
      <div className="inline-flex rounded-full border border-border/50 bg-background p-0.5">
        {MODE_OPTIONS.map(option => {
          const selected = mode === option.value
          const Icon = option.Icon
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ mode: option.value })}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'active:scale-[0.98]',
                selected
                  ? 'bg-background text-foreground shadow-xs ring-1 ring-border/40'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">{option.label}</span>
              <span className="sm:hidden">{option.shortLabel}</span>
            </button>
          )
        })}
      </div>

      {mode === 'schedule' ? (
        <div className="space-y-4 rounded-lg border border-border/40 bg-background p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="schedule-date" className="text-[11px] font-medium text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={
                    schedule.date
                      ? `${schedule.date.getFullYear()}-${String(schedule.date.getMonth() + 1).padStart(2, '0')}-${String(schedule.date.getDate()).padStart(2, '0')}`
                      : ''
                  }
                  min={new Date().toISOString().split('T')[0]}
                  onChange={event => {
                    const value = event.target.value
                    if (!value) {
                      onChange({ date: undefined })
                      return
                    }
                    const [year, month, day] = value.split('-').map(Number)
                    if (year && month && day) {
                      onChange({ date: new Date(year, month - 1, day) })
                    }
                  }}
                  className="h-9 rounded-xl border-border/50 bg-background text-sm shadow-none"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="schedule-time" className="text-[11px] font-medium text-muted-foreground">
                  Time
                </Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={schedule.time ?? '09:00'}
                  onChange={event => onChange({ time: event.target.value })}
                  className="h-9 rounded-xl border-border/50 bg-background text-sm shadow-none"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">Timezone</Label>
              <TimezoneSelector
                value={schedule.timezone}
                onChange={timezone => onChange({ timezone })}
                mode="popover"
              />
            </div>
          </div>

          {schedule.timezone ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {formatTimezoneDetail(schedule.timezone, now)}
            </p>
          ) : null}

          {!schedule.date ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2.5 text-[11px] text-muted-foreground"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow.setHours(9, 0, 0, 0)
                onChange({
                  date: tomorrow,
                  time: '09:00',
                })
              }}
            >
              Quick pick: tomorrow at 9:00 AM
            </Button>
          ) : null}
        </div>
      ) : null}
    </ComposerSection>
  )
}
