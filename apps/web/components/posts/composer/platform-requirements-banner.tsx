'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { SocialProvider } from '@socialista/types'
import { AlertCircleIcon, InfoIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getProvidersRequiringMedia } from '../../../constants/platform-limits'
import type { ComposerValidationIssue } from '../../../types/composer-types'
import { getMediaRequirementHint, groupValidationIssues } from '../../../utils/composer.utils'

type BannerSnapshot = {
  showInfoHint: boolean
  showWarnings: boolean
  mediaHint: string | null
  providers: SocialProvider[]
  issues: ReturnType<typeof groupValidationIssues>
}

function bannerSnapshotsEqual(current: BannerSnapshot | null, next: BannerSnapshot) {
  if (!current) return false
  return (
    current.showInfoHint === next.showInfoHint &&
    current.showWarnings === next.showWarnings &&
    current.mediaHint === next.mediaHint &&
    current.providers === next.providers &&
    current.issues === next.issues
  )
}

type PlatformRequirementsBannerProps = {
  selectedProviders: SocialProvider[]
  validationIssues: ComposerValidationIssue[]
  hasMedia: boolean
  hasContent: boolean
  className?: string
}

export function PlatformRequirementsBanner({
  selectedProviders,
  validationIssues,
  hasMedia,
  hasContent,
  className,
}: PlatformRequirementsBannerProps) {
  const providersRequiringMedia = useMemo(
    () => getProvidersRequiringMedia(selectedProviders).filter(provider => selectedProviders.includes(provider)),
    [selectedProviders],
  )

  const mediaHint = getMediaRequirementHint(selectedProviders, hasMedia)

  const groupedIssues = useMemo(() => {
    const visibleIssues = validationIssues.filter(issue => {
      if (issue.code === 'empty') return false
      if (issue.code === 'caption_required' && !hasContent) return false
      return true
    })

    const withoutMediaRequired = visibleIssues.filter(issue => issue.code !== 'media_required')
    const grouped = groupValidationIssues(withoutMediaRequired)

    const mediaRequired = visibleIssues.filter(issue => issue.code === 'media_required')
    if (mediaRequired.length > 0 && !hasMedia) {
      const hint = getMediaRequirementHint(providersRequiringMedia, false)
      if (hint) {
        grouped.unshift({
          code: 'media_required',
          message: `${hint} — text-only posts aren't supported`,
          accountIds: mediaRequired.flatMap(issue => (issue.accountId ? [issue.accountId] : [])),
        })
      }
    }

    return grouped
  }, [validationIssues, hasContent, hasMedia, providersRequiringMedia])

  const showInfoHint = Boolean(mediaHint) && !hasMedia && groupedIssues.length === 0
  const showWarnings = groupedIssues.length > 0
  const visible = showInfoHint || showWarnings
  const liveSnapshot: BannerSnapshot | null = visible
    ? {
        showInfoHint,
        showWarnings,
        mediaHint,
        providers: providersRequiringMedia,
        issues: groupedIssues,
      }
    : null
  const [snapshot, setSnapshot] = useState(liveSnapshot)
  const [open, setOpen] = useState(false)

  if (liveSnapshot && !bannerSnapshotsEqual(snapshot, liveSnapshot)) {
    setSnapshot(liveSnapshot)
  }

  useEffect(() => {
    if (visible) {
      const frame = requestAnimationFrame(() => setOpen(true))
      return () => cancelAnimationFrame(frame)
    }

    const closeFrame = requestAnimationFrame(() => setOpen(false))
    const timeout = window.setTimeout(() => setSnapshot(null), 200)
    return () => {
      cancelAnimationFrame(closeFrame)
      window.clearTimeout(timeout)
    }
  }, [visible])

  if (!snapshot) return null

  return (
    <div
      className={cn(
        'grid -mb-4 transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
      inert={!open}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            'pb-4 transition-opacity duration-200 ease-out motion-reduce:transition-none',
            open ? 'opacity-100' : 'opacity-0',
          )}
        >
          <BannerBody snapshot={snapshot} />
        </div>
      </div>
    </div>
  )
}

function BannerBody({ snapshot }: { snapshot: BannerSnapshot }) {
  return (
    <div className="space-y-2">
      {snapshot.showInfoHint ? (
        <div className="flex gap-2.5 rounded-xl border border-border/50 bg-muted/15 px-3.5 py-2.5 dark:bg-muted/10">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border/50">
            <InfoIcon className="size-3" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium tracking-tight text-foreground">Media required</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {snapshot.mediaHint}. Add an image or video before publishing to these channels.
            </p>
            {snapshot.providers.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {snapshot.providers.map(provider => (
                  <span
                    key={provider}
                    className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <SocialPlatformIcon provider={provider} size={9} framed={false} className="size-3" />
                    {getSocialPlatformLabel(provider)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {snapshot.showWarnings ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3.5 py-2.5 dark:bg-amber-500/10">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <AlertCircleIcon className="size-3" strokeWidth={1.75} />
            </span>
            <p className="text-xs font-medium tracking-tight text-foreground">Fix before publishing</p>
          </div>
          <ul className="space-y-1.5 pl-7">
            {snapshot.issues.map(issue => (
              <li key={`${issue.code}-${issue.message}`} className="text-[11px] leading-relaxed text-muted-foreground">
                {issue.message}
                {issue.accountIds.length > 1 ? (
                  <span className="text-muted-foreground/70"> · {issue.accountIds.length} accounts</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
