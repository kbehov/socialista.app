'use client'

import { updateExistingPost } from '@/actions/post.actions'
import { AccountIdentity } from '@/components/accounts/account-identity'
import { ComposerEditor } from '@/components/posts/composer/composer-editor'
import { PlatformRequirementsBanner } from '@/components/posts/composer/platform-requirements-banner'
import { PlatformVariantsPanel } from '@/components/posts/composer/platform-variants-panel'
import { PostPreviewBar } from '@/components/posts/composer/post-preview-bar'
import { SchedulePanel } from '@/components/posts/composer/schedule-panel'
import { PostStatusBadge } from '@/components/posts/post-status-badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createFallbackAccount } from '@/lib/posts/post-display'
import type { ComposerData, ComposerMediaItem, ComposerSchedule, ComposerVariant } from '@/types/composer-types'
import { createEmptyVariant, postToComposerState, validateComposer } from '@/utils/composer.utils'
import type { AccountSummary, Post } from '@socialista/types'
import { CalendarClockIcon, FileTextIcon, SendIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

type PostEditSheetProps = {
  post: Post | null
  account?: AccountSummary
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PostEditAccountChip({ account }: { account: AccountSummary }) {
  return <AccountIdentity account={account} />
}

export function PostEditSheet({ post, account, open, onOpenChange }: PostEditSheetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const resolvedAccount = useMemo(() => {
    if (account) return account
    if (post?.account) return post.account
    if (post) return createFallbackAccount(post)
    return null
  }, [account, post])

  const [commonCaption, setCommonCaption] = useState('')
  const [media, setMedia] = useState<ComposerMediaItem[]>([])
  const [variants, setVariants] = useState<Record<string, ComposerVariant>>({})
  const [schedule, setSchedule] = useState<ComposerSchedule>({
    mode: 'schedule',
    timezone: 'UTC',
  })
  const [previewAccountId, setPreviewAccountId] = useState<string | null>(null)

  useEffect(() => {
    if (!post || !open) return

    const state = postToComposerState(post)
    setCommonCaption(state.commonCaption)
    setMedia(state.media)
    setVariants(state.variants)
    setSchedule(state.schedule)
    setPreviewAccountId(state.previewAccountId)
  }, [post, open])

  const selectedAccountIds = useMemo(() => (resolvedAccount ? [resolvedAccount._id] : []), [resolvedAccount])

  const selectedProviders = useMemo(() => (resolvedAccount ? [resolvedAccount.provider] : []), [resolvedAccount])

  const composerState = useMemo<ComposerData | null>(() => {
    if (!post || !resolvedAccount) return null

    return {
      workspaceId: post.workspaceId,
      selectedAccountIds,
      commonCaption,
      media,
      variants,
      schedule,
      previewAccountId,
    }
  }, [post, resolvedAccount, selectedAccountIds, commonCaption, media, variants, schedule, previewAccountId])

  const validationIssues = useMemo(() => {
    if (!composerState || !resolvedAccount) return []
    return validateComposer(composerState, [resolvedAccount])
  }, [composerState, resolvedAccount])

  const hasContent = commonCaption.trim().length > 0 || media.length > 0
  const hasMedia = media.length > 0
  const canSubmit = Boolean(composerState && resolvedAccount && hasContent)
  const isReady = canSubmit && validationIssues.length === 0

  const scheduleMode = schedule.mode === 'draft' ? 'schedule' : schedule.mode
  const primaryLabel = scheduleMode === 'schedule' ? 'Save schedule' : 'Publish now'
  const PrimaryIcon = scheduleMode === 'schedule' ? CalendarClockIcon : SendIcon

  const statusMessage = useMemo(() => {
    if (!resolvedAccount) return 'Loading post…'
    if (isReady) return 'Ready to save changes'
    const blockingIssue = validationIssues.find(issue => issue.code !== 'empty' && issue.code !== 'caption_required')
    if (blockingIssue) return blockingIssue.message
    if (!hasContent) return 'Add a caption or media'
    return 'Fix platform requirements to continue'
  }, [resolvedAccount, isReady, validationIssues, hasContent])

  const setVariant = (accountId: string, patch: Partial<Omit<ComposerVariant, 'accountId'>>) => {
    setVariants(current => {
      const existing = current[accountId] ?? createEmptyVariant(accountId)
      return {
        ...current,
        [accountId]: { ...existing, ...patch, accountId },
      }
    })
  }

  const clearVariantField = (
    accountId: string,
    field: 'caption' | 'description' | 'altText' | 'location' | 'firstComment',
  ) => {
    setVariants(current => {
      const existing = current[accountId] ?? createEmptyVariant(accountId)
      const cleared = field === 'location' ? { ...existing, location: null } : { ...existing, [field]: '' }
      return {
        ...current,
        [accountId]: cleared,
      }
    })
  }

  const handleScheduleChange = (patch: Partial<ComposerSchedule>) => {
    setSchedule(current => ({ ...current, ...patch }))
  }

  const handleSubmit = (intent: 'draft' | 'schedule' | 'publish') => {
    if (!post || !resolvedAccount || !composerState) return

    startTransition(async () => {
      const result = await updateExistingPost({
        post,
        account: resolvedAccount,
        state: composerState,
        intent,
      })

      if (!result.success) {
        toast.error(result.message ?? 'Failed to update post')
        return
      }

      const labels: Record<typeof intent, string> = {
        draft: 'Draft saved',
        schedule: 'Schedule updated',
        publish: 'Publishing',
      }
      toast.success(labels[intent])
      onOpenChange(false)
      router.refresh()
    })
  }

  const accounts = resolvedAccount ? [resolvedAccount] : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={!isPending}
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full sm:max-w-lg lg:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-foreground/10 px-6 py-3.5 pr-12 text-left">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <SheetTitle className="text-[15px] font-medium tracking-[-0.02em]">Edit post</SheetTitle>
            {post ? <PostStatusBadge status={post.status} /> : null}
          </div>
          <SheetDescription className="mt-1.5 text-[13px] text-foreground/56">{statusMessage}</SheetDescription>
        </SheetHeader>

        {post && resolvedAccount && composerState ? (
          <>
            <ScrollArea className="min-h-0 flex-1" scrollFade scrollbarGutter>
              <div className="flex flex-col gap-4 px-6 py-5">
                <PostEditAccountChip account={resolvedAccount} />

                <PlatformRequirementsBanner
                  selectedProviders={selectedProviders}
                  validationIssues={validationIssues}
                  hasMedia={hasMedia}
                  hasContent={hasContent}
                />

                <ComposerEditor
                  workspaceId={post.workspaceId}
                  caption={commonCaption}
                  media={media}
                  selectedProviders={selectedProviders}
                  layout="sheet"
                  onCaptionChange={setCommonCaption}
                  onAddMedia={item => setMedia(current => [...current, item])}
                  onRemoveMedia={index => setMedia(current => current.filter((_, i) => i !== index))}
                  onReorderMedia={(fromIndex, toIndex) =>
                    setMedia(current => {
                      if (
                        fromIndex < 0 ||
                        toIndex < 0 ||
                        fromIndex >= current.length ||
                        toIndex >= current.length ||
                        fromIndex === toIndex
                      ) {
                        return current
                      }
                      const next = [...current]
                      const [moved] = next.splice(fromIndex, 1)
                      if (!moved) return current
                      next.splice(toIndex, 0, moved)
                      return next
                    })
                  }
                  onUpdateMediaAltText={(index, altText) =>
                    setMedia(current =>
                      current.map((item, i) => {
                        if (i !== index || item.kind !== 'image') return item
                        return { ...item, altText }
                      }),
                    )
                  }
                />

                <SchedulePanel schedule={schedule} onChange={handleScheduleChange} layout="sheet" />

                <PlatformVariantsPanel
                  accounts={accounts}
                  selectedAccountIds={selectedAccountIds}
                  commonCaption={commonCaption}
                  variants={variants}
                  onVariantChange={setVariant}
                  onClearField={clearVariantField}
                />

                <PostPreviewBar
                  accounts={accounts}
                  selectedAccountIds={selectedAccountIds}
                  previewAccountId={previewAccountId}
                  commonCaption={commonCaption}
                  media={media}
                  variants={variants}
                  onPreviewAccountChange={setPreviewAccountId}
                />
              </div>
            </ScrollArea>

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-foreground/10 px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full rounded-md px-3.5 text-[13px] font-medium shadow-none sm:w-auto"
                disabled={!canSubmit || isPending}
                onClick={() => handleSubmit('draft')}
              >
                <FileTextIcon className="size-3.5" strokeWidth={1.75} />
                Save draft
              </Button>

              <Button
                type="button"
                size="sm"
                className="h-8 w-full rounded-md px-3.5 text-[13px] font-medium sm:w-auto"
                disabled={!isReady || isPending}
                onClick={() => handleSubmit(scheduleMode === 'schedule' ? 'schedule' : 'publish')}
              >
                <PrimaryIcon className="size-3.5" strokeWidth={1.75} />
                {isPending ? 'Saving…' : primaryLabel}
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
