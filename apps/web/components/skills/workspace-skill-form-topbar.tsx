'use client'

import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ChevronLeftIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'

type WorkspaceSkillFormTopbarProps = {
  displayName: string
  isEditing: boolean
  isSubmitting: boolean
}

export function WorkspaceSkillFormTopbar({
  displayName,
  isEditing,
  isSubmitting,
}: WorkspaceSkillFormTopbarProps) {
  return (
    <div className="-mx-(--spacing-dashboard-x) sticky top-0 z-20 border-b border-border/50 bg-background/85 px-(--spacing-dashboard-x) py-2 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={DASHBOARD_ROUTES.SKILLS} aria-label="Back to skills">
              <ChevronLeftIcon className="size-4" strokeWidth={1.75} />
            </Link>
          </Button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <Link
              href={DASHBOARD_ROUTES.SKILLS}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              Skills
            </Link>
            <span className="shrink-0 text-muted-foreground/50">/</span>
            <span className="truncate font-medium text-foreground/80">{displayName}</span>
          </nav>
        </div>

        <Button type="submit" size="sm" className="h-8 rounded-lg px-3.5" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              {isEditing ? 'Saving…' : 'Creating…'}
            </>
          ) : isEditing ? (
            'Save'
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </div>
  )
}
