'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { SocialProvider } from '@socialista/types'
import { AlertCircleIcon, InfoIcon } from 'lucide-react'
import { useMemo } from 'react'

import type { ComposerValidationIssue } from './composer-types'
import { getMediaRequirementHint, groupValidationIssues } from './composer-utils'
import { getProvidersRequiringMedia } from './platform-limits'

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
    () =>
      getProvidersRequiringMedia(selectedProviders).filter(provider =>
        selectedProviders.includes(provider),
      ),
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
          accountIds: mediaRequired.flatMap(issue =>
            issue.accountId ? [issue.accountId] : [],
          ),
        })
      }
    }

    return grouped
  }, [validationIssues, hasContent, hasMedia, providersRequiringMedia])

  const showInfoHint = Boolean(mediaHint) && !hasMedia && groupedIssues.length === 0
  const showWarnings = groupedIssues.length > 0

  if (!showInfoHint && !showWarnings) return null

  return (
    <div className={cn('space-y-2', className)}>
      {showInfoHint ? (
        <div className="flex gap-2.5 rounded-xl border border-border/50 bg-background px-3 py-2.5">
          <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-foreground">Platform requirements</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {mediaHint}. Add media before publishing to these channels.
            </p>
            {providersRequiringMedia.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {providersRequiringMedia.map(provider => (
                  <span
                    key={provider}
                    className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
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

      {showWarnings ? (
        <div className="rounded-xl border border-amber-500/30 bg-background px-3 py-2.5">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircleIcon
              className="size-3.5 text-amber-600 dark:text-amber-500"
              strokeWidth={1.75}
            />
            <p className="text-xs font-medium text-foreground">Fix before publishing</p>
          </div>
          <ul className="space-y-1.5">
            {groupedIssues.map(issue => (
              <li
                key={`${issue.code}-${issue.message}`}
                className="text-[11px] leading-relaxed text-muted-foreground"
              >
                {issue.message}
                {issue.accountIds.length > 1 ? (
                  <span className="text-muted-foreground/70">
                    {' '}
                    · {issue.accountIds.length} accounts
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
