'use client'

import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { dashboardSurface } from '@/components/dashboard/surface'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  DASHBOARD_ONBOARDING_DISMISS_STORAGE_KEY,
  type DashboardOnboardingSnapshot,
  isOnboardingComplete,
} from '@/lib/dashboard/onboarding'
import { cn } from '@/lib/utils'
import { CheckIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

type DashboardGetStartedProps = {
  workspaceId: string
  snapshot: DashboardOnboardingSnapshot
  className?: string
}

type OnboardingStep = {
  id: string
  title: string
  description: string
  emoji: string
  done: boolean
  action: ReactNode
}

function dismissKey(workspaceId: string) {
  return `${DASHBOARD_ONBOARDING_DISMISS_STORAGE_KEY}:${workspaceId}`
}

function readDismissed(workspaceId: string): boolean {
  try {
    return localStorage.getItem(dismissKey(workspaceId)) === '1'
  } catch {
    return false
  }
}

function DashboardGetStarted({ workspaceId, snapshot, className }: DashboardGetStartedProps) {
  const [dismissed, setDismissed] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDismissed(readDismissed(workspaceId))
  }, [workspaceId])

  const steps = useMemo<OnboardingStep[]>(() => {
    const hasAccount = snapshot.connectedAccounts > 0
    const hasPostActivity = snapshot.hasScheduledOrPublished
    const hasStudioRun = snapshot.generationCount > 0

    return [
      {
        id: 'connect',
        title: 'Connect a channel',
        description: 'Link Instagram, TikTok, LinkedIn, and more — one hub for every network.',
        emoji: '🔗',
        done: hasAccount,
        action: hasAccount ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckIcon className="size-3.5" strokeWidth={2} aria-hidden />
            You&apos;re linked
          </span>
        ) : (
          <ConnectAccountTrigger label="Connect account" showPlusIcon={false} />
        ),
      },
      {
        id: 'schedule',
        title: 'Schedule a post',
        description: 'Write once, pick a time, and let your queue do the rest.',
        emoji: '📅',
        done: hasPostActivity,
        action: hasPostActivity ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckIcon className="size-3.5" strokeWidth={2} aria-hidden />
            Queued up
          </span>
        ) : (
          <Button
            size="sm"
            variant={hasAccount ? 'default' : 'secondary'}
            className={cn(dashboardSurface.createCta, 'h-9 px-3 text-xs')}
            disabled={!hasAccount}
            asChild={hasAccount}
          >
            {hasAccount ? (
              <Link href={DASHBOARD_ROUTES.createPost()}>Create post ✨</Link>
            ) : (
              <span>Connect a channel first</span>
            )}
          </Button>
        ),
      },
      {
        id: 'studio',
        title: 'Create with Studio',
        description: 'Spin up AI images or video, then ship them as posts in a click.',
        emoji: '✨',
        done: hasStudioRun,
        action: hasStudioRun ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckIcon className="size-3.5" strokeWidth={2} aria-hidden />
            First creation done
          </span>
        ) : (
          <Button size="sm" variant="secondary" className={cn(dashboardSurface.createCta, 'h-9 px-3 text-xs')} asChild>
            <Link href={DASHBOARD_ROUTES.STUDIO.IMAGES}>Open image studio</Link>
          </Button>
        ),
      },
    ]
  }, [snapshot])

  const completedCount = steps.filter(step => step.done).length
  const complete = isOnboardingComplete(snapshot)

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(dismissKey(workspaceId), '1')
    } catch {
      // private mode / disabled storage
    }
    setDismissed(true)
  }, [workspaceId])

  if (!mounted || dismissed || complete) {
    return null
  }

  const progressPercent = Math.round((completedCount / steps.length) * 100)
  const progressLabel =
    completedCount === 0 ? 'Let’s go' : completedCount === steps.length ? 'All set' : 'Nice momentum'

  return (
    <section className={cn('flex flex-col gap-5', className)} aria-labelledby="dashboard-get-started-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
            <p className="inline-flex items-center gap-1.5">
              <span aria-hidden>👋</span>
              Welcome aboard
            </p>
            <span className="tabular-nums">
              {completedCount}/{steps.length} · {progressLabel}
            </span>
          </div>
          <h2
            id="dashboard-get-started-title"
            className="text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]"
          >
            Three quick wins to get you publishing
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Hook up a channel, drop something on the calendar, and try Studio — your analytics and feed will come
            alive as you go.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:pt-0.5">
          <div className="hidden items-center gap-2 sm:flex" aria-hidden>
            <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/70 transition-[width] duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
            aria-label="Dismiss getting started guide"
          >
            <XIcon className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'flex min-h-[10.5rem] flex-col rounded-lg px-4 py-4 sm:px-5 sm:py-5',
              step.done ? 'bg-muted/25' : 'bg-muted/15',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-[var(--control-radius)] text-lg leading-none select-none',
                  step.done ? 'bg-primary/10' : 'bg-muted/40',
                )}
                aria-hidden
              >
                {step.emoji}
              </div>
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">Step {index + 1}</span>
            </div>

            <div className="mt-3 flex min-h-0 flex-1 flex-col">
              <p className="text-[13px] font-medium text-foreground">{step.title}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              <div className="mt-4 flex flex-wrap items-center">{step.action}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { DashboardGetStarted }
