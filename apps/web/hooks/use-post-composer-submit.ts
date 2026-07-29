'use client'

import { publishOrSchedulePosts } from '@/actions/post.actions'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { ComposerData } from '@/types/composer-types'
import { validateComposer } from '@/utils/composer.utils'
import type { AccountSummary } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useMemo, useTransition } from 'react'
import { toast } from 'sonner'

type UsePostComposerSubmitArgs = {
  workspaceId: string
  connectedAccounts: AccountSummary[]
  selectedAccountIds: string[]
  commonCaption: string
  media: ComposerData['media']
  variants: ComposerData['variants']
  schedule: ComposerData['schedule']
  previewAccountId: string | null
}

export function usePostComposerSubmit({
  workspaceId,
  connectedAccounts,
  selectedAccountIds,
  commonCaption,
  media,
  variants,
  schedule,
  previewAccountId,
}: UsePostComposerSubmitArgs) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const composerState = useMemo<ComposerData>(
    () => ({
      workspaceId,
      selectedAccountIds,
      commonCaption,
      media,
      variants,
      schedule,
      previewAccountId,
    }),
    [workspaceId, selectedAccountIds, commonCaption, media, variants, schedule, previewAccountId],
  )

  const validationIssues = useMemo(
    () => (selectedAccountIds.length > 0 ? validateComposer(composerState, connectedAccounts) : []),
    [selectedAccountIds.length, composerState, connectedAccounts],
  )

  const hasContent = commonCaption.trim().length > 0 || media.length > 0
  const canSubmit = selectedAccountIds.length > 0 && hasContent
  const isReady = canSubmit && validationIssues.length === 0

  const statusMessage = useMemo(() => {
    if (selectedAccountIds.length === 0) return 'Select accounts to begin'
    if (isReady) {
      return `Ready for ${selectedAccountIds.length} account${selectedAccountIds.length === 1 ? '' : 's'}`
    }
    const blockingIssue = validationIssues.find(
      issue => issue.code !== 'empty' && issue.code !== 'caption_required',
    )
    if (blockingIssue) return blockingIssue.message
    if (!hasContent) return 'Add a caption or media'
    return 'Fix platform requirements to publish'
  }, [selectedAccountIds.length, isReady, validationIssues, hasContent])

  const handleSubmit = (asDraft: boolean) => {
    const issues = validateComposer(composerState, connectedAccounts)

    if (issues.length > 0 && !asDraft) {
      toast.error(issues[0]?.message ?? 'Fix validation errors')
      return
    }

    if (asDraft && selectedAccountIds.length === 0) {
      toast.error('Select at least one account')
      return
    }

    startTransition(async () => {
      const results = await publishOrSchedulePosts({
        accounts: connectedAccounts,
        state: composerState,
        asDraft,
      })

      const failed = results.filter(result => result.status === 'failed')
      const succeeded = results.filter(result => result.status !== 'failed')

      if (succeeded.length > 0) {
        const label =
          asDraft ? 'Draft saved' : composerState.schedule.mode === 'schedule' ? 'Scheduled' : 'Publishing'
        toast.success(`${label} for ${succeeded.length} account${succeeded.length === 1 ? '' : 's'}`)
      }

      for (const result of failed) {
        const account = connectedAccounts.find(item => item._id === result.accountId)
        toast.error(`${account?.accountName ?? 'Account'}: ${result.message ?? 'Failed'}`)
      }

      if (failed.length === 0 && succeeded.length > 0) {
        router.push(DASHBOARD_ROUTES.POSTS)
        router.refresh()
      }
    })
  }

  return {
    composerState,
    validationIssues,
    hasContent,
    hasMedia: media.length > 0,
    canSubmit,
    isReady,
    statusMessage,
    isPending,
    handleSubmit,
  }
}
