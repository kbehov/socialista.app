'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Calendar } from '@/components/ui/calendar'
import { toDateKey } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState, type ComponentProps } from 'react'
import type { DayButton } from 'react-day-picker'

import { landingWorkflowInsetCardDark } from './landing-classes'
import { LANDING_WORKFLOW_MOCKUP } from './media'

const MOCKUP_IMAGE_QUALITY = 80

function startOfWeek(date: Date, weekStartsOn = 1): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = (d.getDay() - weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() + days)
  return d
}

/** Always shows the current week. Only mounted client-side (active tab), so `new Date()` is hydration-safe. */
function buildDisplayWeek(today = new Date()) {
  const start = startOfWeek(today, 1)
  const end = addDays(start, 6)
  const startKey = toDateKey(start)
  const endKey = toDateKey(end)
  return {
    today,
    start,
    dateInWeek: (dayOffset: number) => addDays(start, dayOffset),
    isInWeek: (date: Date) => {
      const key = toDateKey(date)
      return key >= startKey && key <= endKey
    },
    label: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(
      'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' },
    )}`,
  }
}

type DisplayWeek = ReturnType<typeof buildDisplayWeek>

type MockScheduledPost = {
  thumb: string
  objectPosition?: string
  provider: 'instagram' | 'tiktok' | 'linkedin'
  title: string
  time: string
}

const calendarClassNames = {
  root: 'w-full max-w-none',
  months: 'w-full max-w-none',
  month: 'relative w-full max-w-none gap-2',
  nav: 'hidden',
  month_caption: 'hidden',
  month_grid: 'w-full max-w-none',
  weekdays: 'flex w-full',
  weekday:
    'flex h-6 flex-1 basis-0 items-center justify-center text-[10px] font-medium text-white/38 normal-case select-none sm:text-[11px]',
  week: 'flex w-full gap-1 sm:gap-1.5',
  day: 'relative flex min-h-0 flex-1 basis-0 min-w-0',
  outside: 'text-white/22 aria-selected:text-white/22',
  disabled: 'text-white/20 opacity-40',
  hidden: 'hidden',
  today: 'rounded-xl bg-white/[0.08] text-white data-[selected=true]:rounded-xl',
} as const

function formatWeekdayName(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
}

function buildMockPostsByDate(week: DisplayWeek): Map<string, MockScheduledPost[]> {
  const { calendarThumbs, queue } = LANDING_WORKFLOW_MOCKUP.scheduling

  const post = (
    dayOffset: number,
    index: number,
    overrides?: Partial<MockScheduledPost>,
  ): [string, MockScheduledPost[]] => {
    const date = week.dateInWeek(dayOffset)
    return [
      toDateKey(date),
      [
        {
          thumb: calendarThumbs[index % calendarThumbs.length]!,
          objectPosition: queue.objectPosition,
          provider: index % 2 === 0 ? 'instagram' : 'tiktok',
          title: index === 1 ? 'Glow serum · Reel' : 'Summer drop · Carousel',
          time: index % 2 === 0 ? '9:00 AM' : '2:30 PM',
          ...overrides,
        },
      ],
    ]
  }

  return new Map([
    post(1, 0),
    post(2, 1, { title: 'Glow serum · Reel', time: '9:00 AM', provider: 'instagram' }),
    post(4, 2, { provider: 'linkedin', title: 'Founder story', time: '11:15 AM' }),
    post(6, 0, {
      thumb: queue.src,
      objectPosition: queue.objectPosition,
      title: 'UGC hook test',
      time: '6:00 PM',
      provider: 'tiktok',
    }),
  ])
}

function resolveDefaultSelectedDay(week: DisplayWeek, postsByDate: Map<string, MockScheduledPost[]>): Date {
  if ((postsByDate.get(toDateKey(week.today))?.length ?? 0) > 0) return week.today
  for (let offset = 0; offset < 7; offset++) {
    const date = week.dateInWeek(offset)
    if ((postsByDate.get(toDateKey(date))?.length ?? 0) > 0) return date
  }
  return week.today
}

function LandingScheduleDayButton({
  postsByDate,
  day,
  modifiers,
  className,
  ...buttonProps
}: ComponentProps<typeof DayButton> & {
  postsByDate: Map<string, MockScheduledPost[]>
}) {
  const post = postsByDate.get(toDateKey(day.date))?.[0]
  const isSelected = modifiers.selected
  const dayNum = day.date.getDate()

  return (
    <button
      type="button"
      {...buttonProps}
      className={cn(
        'relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl text-left sm:rounded-2xl',
        'border border-white/[0.1] bg-[#121212]',
        'transition-[transform,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
        'hover:border-white/20 active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]',
        post
          ? 'aspect-[3/4] min-h-[4.5rem] sm:min-h-[5rem]'
          : 'min-h-11 items-center justify-center',
        isSelected &&
          'border-white/35 shadow-[0_10px_28px_-16px_rgba(0,0,0,0.85)] ring-1 ring-white/30',
        className,
      )}
    >
      {post ? (
        <>
          <Image
            src={post.thumb}
            alt=""
            fill
            quality={MOCKUP_IMAGE_QUALITY}
            sizes="(max-width: 640px) 16vw, (max-width: 1024px) 10vw, 96px"
            className="object-cover"
            style={post.objectPosition ? { objectPosition: post.objectPosition } : undefined}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/15"
            aria-hidden="true"
          />
          <span
            className={cn(
              'absolute top-1.5 left-1.5 z-10 rounded-lg px-1.5 py-0.5 text-[10px] font-semibold tabular-nums backdrop-blur-sm',
              isSelected ? 'bg-white text-[#111]' : 'bg-black/55 text-white',
            )}
          >
            {dayNum}
          </span>
        </>
      ) : (
        <span
          className={cn(
            'text-[11px] font-medium tabular-nums sm:text-[12px]',
            isSelected ? 'text-white' : 'text-white/38',
          )}
        >
          {dayNum}
        </span>
      )}
    </button>
  )
}

export function WorkflowSchedulingMockup() {
  const week = useMemo(() => buildDisplayWeek(), [])
  const postsByDate = useMemo(() => buildMockPostsByDate(week), [week])
  const [selectedDay, setSelectedDay] = useState(() => resolveDefaultSelectedDay(week, postsByDate))

  const featured = postsByDate.get(toDateKey(selectedDay))?.[0]
  const selectedWeekday = selectedDay.toLocaleDateString('en-US', { weekday: 'short' })

  const scheduledCount = useMemo(() => {
    let total = 0
    for (let offset = 0; offset < 7; offset++) {
      total += postsByDate.get(toDateKey(week.dateInWeek(offset)))?.length ?? 0
    }
    return total
  }, [postsByDate, week])

  return (
    <div className="flex min-h-[18rem] flex-col justify-between p-4 sm:min-h-[20rem] sm:p-5 lg:min-h-[21rem]">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium tracking-[-0.02em] text-white/90">
              {week.label}
            </p>
            <p className="mt-0.5 text-[11px] text-white/45">
              <span className="font-medium tabular-nums text-white/70">{scheduledCount}</span> this week
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-white/30" aria-hidden="true">
            <ChevronLeft className="size-4" strokeWidth={1.5} />
            <ChevronRight className="size-4" strokeWidth={1.5} />
          </div>
        </div>

        <div className="min-h-0 flex-1 pt-1">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={day => {
              if (day && week.isInWeek(day)) setSelectedDay(day)
            }}
            month={week.start}
            defaultMonth={week.start}
            disableNavigation
            formatters={{ formatWeekdayName }}
            showOutsideDays
            fixedWeeks={false}
            modifiers={{
              hidden: date => !week.isInWeek(date),
            }}
            className="w-full max-w-none bg-transparent p-0 text-white [--rdp-weekday-text-transform:none]"
            classNames={calendarClassNames}
            components={{
              Week: ({ week: calendarWeek, ...props }) => {
                const showWeek = calendarWeek.days.some(({ date }) => week.isInWeek(date))
                if (!showWeek) return null
                return <tr {...props} />
              },
              DayButton: dayProps => (
                <LandingScheduleDayButton {...dayProps} postsByDate={postsByDate} />
              ),
            }}
          />
        </div>
      </div>

      {featured ? (
        <div
          className={cn(
            landingWorkflowInsetCardDark,
            'mt-4 flex items-center justify-between gap-3 rounded-2xl border-white/10 px-3.5 py-3 sm:mt-5 sm:px-4 sm:py-3.5',
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-[#141414] outline outline-1 outline-[oklch(1_0_0/0.12)] sm:size-12 sm:rounded-2xl">
              <Image
                src={featured.thumb}
                alt=""
                fill
                quality={MOCKUP_IMAGE_QUALITY}
                sizes="80px"
                className="object-cover"
                style={
                  featured.objectPosition ? { objectPosition: featured.objectPosition } : undefined
                }
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <SocialPlatformIcon provider={featured.provider} className="size-3.5 shrink-0 opacity-90" />
                <p className="truncate text-[0.8125rem] font-medium tracking-[-0.02em] text-white">
                  {featured.title}
                </p>
              </div>
              <p className="text-[0.6875rem] text-white/45">
                {selectedWeekday} · {featured.time}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-white/14 px-2.5 py-1 text-[0.625rem] font-medium text-white/75">
            Scheduled
          </span>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-white/12 px-4 py-4 text-[0.75rem] text-white/45 sm:mt-5 sm:py-[1.1rem]">
          Nothing on {selectedWeekday} yet — drop a post here
        </div>
      )}
    </div>
  )
}
