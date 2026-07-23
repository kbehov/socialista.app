'use client'

import { publishOrSchedulePosts } from '@/actions/post.actions'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  usePostComposerActions,
  usePostComposerStore,
} from '@/store/post-composer.store'
import { ConnectionStatus, type Account } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

import { AccountSelector } from './account-selector'
import { ComposerEditor } from './composer-editor'
import { ComposerHeader } from './composer-header'
import { getDefaultTimezone, getAccountsWithIssues, validateComposer } from './composer-utils'
import { PlatformRequirementsBanner } from './platform-requirements-banner'
import { PlatformVariantsPanel } from './platform-variants-panel'
import { PostPreviewBar } from './post-preview-bar'
import { SchedulePanel } from './schedule-panel'

type PostComposerProps = {
  workspaceId: string
  accounts: Account[]
}

export function PostComposer({ workspaceId, accounts }: PostComposerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [previewCollapsed, setPreviewCollapsed] = useState(false)

  const connectedAccounts = useMemo(
    () => accounts.filter(account => account.connectionStatus === ConnectionStatus.CONNECTED),
    [accounts],
  )

  const selectedAccountIds = usePostComposerStore(s => s.selectedAccountIds)
  const commonCaption = usePostComposerStore(s => s.commonCaption)
  const media = usePostComposerStore(s => s.media)
  const variants = usePostComposerStore(s => s.variants)
  const schedule = usePostComposerStore(s => s.schedule)
  const previewAccountId = usePostComposerStore(s => s.previewAccountId)
  const storeWorkspaceId = usePostComposerStore(s => s.workspaceId)

  const {
    hydrate,
    toggleAccount,
    setSelectedAccountIds,
    setCommonCaption,
    addMedia,
    removeMedia,
    reorderMedia,
    updateMediaAltText,
    setVariant,
    clearVariantField,
    setSchedule,
    setPreviewAccountId,
    reset,
  } = usePostComposerActions()

  useEffect(() => {
    hydrate(workspaceId, getDefaultTimezone(connectedAccounts, []))
    return () => reset()
    // Reset/hydrate only when the workspace changes — not when the account list identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, hydrate, reset])

  useEffect(() => {
    if (selectedAccountIds.length !== 1) return
    const timezone = getDefaultTimezone(connectedAccounts, selectedAccountIds)
    if (timezone && timezone !== schedule.timezone) {
      setSchedule({ timezone })
    }
  }, [selectedAccountIds, connectedAccounts, schedule.timezone, setSchedule])

  const selectedProviders = useMemo(
    () =>
      connectedAccounts
        .filter(account => selectedAccountIds.includes(account._id))
        .map(account => account.provider),
    [connectedAccounts, selectedAccountIds],
  )

  const hasContent = commonCaption.trim().length > 0 || media.length > 0
  const hasMedia = media.length > 0
  const canSubmit =
    storeWorkspaceId === workspaceId && selectedAccountIds.length > 0 && hasContent

  const composerState = useMemo(
    () => ({
      workspaceId,
      selectedAccountIds,
      commonCaption,
      media,
      variants,
      schedule,
      previewAccountId,
    }),
    [
      workspaceId,
      selectedAccountIds,
      commonCaption,
      media,
      variants,
      schedule,
      previewAccountId,
    ],
  )

  const validationIssues = useMemo(
    () =>
      selectedAccountIds.length > 0
        ? validateComposer(composerState, connectedAccounts)
        : [],
    [selectedAccountIds.length, composerState, connectedAccounts],
  )

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

  const accountsWithIssues = useMemo(
    () => getAccountsWithIssues(validationIssues),
    [validationIssues],
  )

  const snapshotState = () => ({
    workspaceId,
    selectedAccountIds,
    commonCaption,
    media,
    variants,
    schedule,
    previewAccountId,
  })

  const handleSubmit = (asDraft: boolean) => {
    const state = snapshotState()
    const issues = validateComposer(state, connectedAccounts)

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
        state,
        asDraft,
      })

      const failed = results.filter(result => result.status === 'failed')
      const succeeded = results.filter(result => result.status !== 'failed')

      if (succeeded.length > 0) {
        const label = asDraft
          ? 'Draft saved'
          : state.schedule.mode === 'schedule'
            ? 'Scheduled'
            : 'Queued to publish'
        toast.success(
          `${label} for ${succeeded.length} account${succeeded.length === 1 ? '' : 's'}`,
        )
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ComposerHeader
        canSubmit={canSubmit}
        isSubmitting={isPending}
        isReady={isReady}
        statusMessage={statusMessage}
        scheduleMode={schedule.mode}
        onSaveDraft={() => handleSubmit(true)}
        onPublish={() => handleSubmit(false)}
      />

      <div
        className={cn(
          'grid min-h-0 flex-1 gap-4 pt-1',
          previewCollapsed
            ? 'lg:grid-cols-[minmax(0,1fr)_2rem]'
            : 'lg:grid-cols-[minmax(0,1fr)_minmax(220px,260px)]',
        )}
      >
        <ScrollArea className="min-h-0" scrollFade scrollbarGutter>
          <div className="flex flex-col gap-4 pb-24 sm:gap-5 sm:pb-8 lg:pb-6">
            <AccountSelector
              accounts={connectedAccounts}
              selectedAccountIds={selectedAccountIds}
              onToggle={toggleAccount}
              onSelectAccounts={setSelectedAccountIds}
              onClearAll={() => setSelectedAccountIds([])}
              accountsWithIssues={accountsWithIssues}
            />

            <PlatformRequirementsBanner
              selectedProviders={selectedProviders}
              validationIssues={validationIssues}
              hasMedia={hasMedia}
              hasContent={hasContent}
            />

            <ComposerEditor
              workspaceId={workspaceId}
              caption={commonCaption}
              media={media}
              selectedProviders={selectedProviders}
              onCaptionChange={setCommonCaption}
              onAddMedia={addMedia}
              onRemoveMedia={removeMedia}
              onReorderMedia={reorderMedia}
              onUpdateMediaAltText={updateMediaAltText}
            />

            <SchedulePanel schedule={schedule} onChange={setSchedule} />

            <PlatformVariantsPanel
              accounts={connectedAccounts}
              selectedAccountIds={selectedAccountIds}
              commonCaption={commonCaption}
              variants={variants}
              onVariantChange={setVariant}
              onClearField={clearVariantField}
            />

            <div className="lg:hidden">
              <PostPreviewBar
                accounts={connectedAccounts}
                selectedAccountIds={selectedAccountIds}
                previewAccountId={previewAccountId}
                commonCaption={commonCaption}
                media={media}
                variants={variants}
                onPreviewAccountChange={setPreviewAccountId}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="hidden min-h-0 lg:block">
          <div className="sticky top-[4.25rem]">
            <PostPreviewBar
              accounts={connectedAccounts}
              selectedAccountIds={selectedAccountIds}
              previewAccountId={previewAccountId}
              commonCaption={commonCaption}
              media={media}
              variants={variants}
              onPreviewAccountChange={setPreviewAccountId}
              collapsed={previewCollapsed}
              onCollapsedChange={setPreviewCollapsed}
              className="max-h-[calc(100vh-7rem)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
