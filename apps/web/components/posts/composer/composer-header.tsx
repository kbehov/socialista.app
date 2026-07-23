'use client'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  FileTextIcon,
  SendIcon,
} from 'lucide-react'
import Link from 'next/link'

type ComposerHeaderProps = {
  canSubmit: boolean
  isSubmitting: boolean
  isReady: boolean
  statusMessage: string
  scheduleMode: 'now' | 'schedule' | 'draft'
  onSaveDraft: () => void
  onPublish: () => void
  className?: string
}

export function ComposerHeader({
  canSubmit,
  isSubmitting,
  isReady,
  statusMessage,
  scheduleMode,
  onSaveDraft,
  onPublish,
  className,
}: ComposerHeaderProps) {
  const primaryLabel =
    scheduleMode === 'schedule' ? 'Schedule' : scheduleMode === 'draft' ? 'Save draft' : 'Publish now'
  const PrimaryIcon = scheduleMode === 'schedule' ? CalendarClockIcon : SendIcon

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-20 -mx-1 px-1',
          'border-b border-border/40 bg-background/75 backdrop-blur-xl backdrop-saturate-150',
          'supports-[backdrop-filter]:bg-background/60',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button
              asChild
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground active:scale-[0.97]"
            >
              <Link href={DASHBOARD_ROUTES.POSTS} aria-label="Back to posts">
                <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
                Create post
              </h1>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {isReady ? (
                  <CheckCircle2Icon className="size-3 text-emerald-500" strokeWidth={2} />
                ) : (
                  <CircleDashedIcon className="size-3" strokeWidth={1.75} />
                )}
                <span className="truncate">{statusMessage}</span>
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-border/60 px-3.5 text-xs font-medium shadow-none active:scale-[0.98]"
              disabled={!canSubmit || isSubmitting}
              onClick={onSaveDraft}
            >
              <FileTextIcon className="size-3.5" strokeWidth={1.75} />
              Save draft
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-4 text-xs font-medium shadow-xs active:scale-[0.98]"
              disabled={!isReady || isSubmitting}
              onClick={onPublish}
            >
              <PrimaryIcon className="size-3.5" strokeWidth={1.75} />
              {isSubmitting ? 'Working…' : primaryLabel}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile sticky action bar */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-border/50 p-3 sm:hidden',
          'bg-background/85 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/70',
        )}
      >
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 flex-1 rounded-full border-border/60 text-xs font-medium shadow-none active:scale-[0.98]"
            disabled={!canSubmit || isSubmitting}
            onClick={onSaveDraft}
          >
            <FileTextIcon className="size-3.5" strokeWidth={1.75} />
            Draft
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-10 flex-[1.4] rounded-full text-xs font-medium shadow-xs active:scale-[0.98]"
            disabled={!isReady || isSubmitting}
            onClick={onPublish}
          >
            <PrimaryIcon className="size-3.5" strokeWidth={1.75} />
            {isSubmitting ? 'Working…' : primaryLabel}
          </Button>
        </div>
      </div>
    </>
  )
}
