'use client'

import { updateExistingPost } from '@/actions/post.actions'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { ComposerEditor } from '@/components/posts/composer/composer-editor'
import { PlatformRequirementsBanner } from '@/components/posts/composer/platform-requirements-banner'
import { PlatformVariantsPanel } from '@/components/posts/composer/platform-variants-panel'
import { PostPreviewBar } from '@/components/posts/composer/post-preview-bar'
import { SchedulePanel } from '@/components/posts/composer/schedule-panel'
import { POST_STATUS_META } from '@/components/posts/post-meta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createFallbackAccount } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import type { ComposerData, ComposerMediaItem, ComposerSchedule, ComposerVariant } from '@/types/composer-types'
import { createEmptyVariant, postToComposerState, validateComposer } from '@/utils/composer.utils'
import type { AccountSummary, Post } from '@socialista/types'
import { CalendarClockIcon, CheckCircle2Icon, CircleDashedIcon, FileTextIcon, SendIcon } from 'lucide-react'
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
  const label = account.accountName || account.username || 'Account'

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
      <SocialPlatformIcon provider={account.provider} size={12} className="size-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{getSocialPlatformLabel(account.provider)}</p>
      </div>
    </div>
  )
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

  const statusMeta = post ? POST_STATUS_META[post.status] : null
  const accounts = resolvedAccount ? [resolvedAccount] : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={!isPending}
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full sm:max-w-lg lg:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-2 border-b border-border/60 px-5 py-4 pr-12 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="text-[15px] font-semibold tracking-[-0.01em]">Edit post</SheetTitle>
            {statusMeta ? (
              <Badge
                variant="outline"
                className={cn('h-5 rounded-full px-2 text-[10px] font-medium', statusMeta.className)}
              >
                {statusMeta.label}
              </Badge>
            ) : null}
          </div>
          <SheetDescription className="flex items-center gap-1.5 text-xs leading-relaxed">
            {isReady ? (
              <CheckCircle2Icon className="size-3 text-emerald-500" strokeWidth={2} />
            ) : (
              <CircleDashedIcon className="size-3" strokeWidth={1.75} />
            )}
            <span>{statusMessage}</span>
          </SheetDescription>
        </SheetHeader>

        {post && resolvedAccount && composerState ? (
          <>
            <ScrollArea className="min-h-0 flex-1" scrollFade scrollbarGutter>
              <div className="flex flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
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

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border/60 bg-muted/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full rounded-full border-border/60 px-3.5 text-xs font-medium shadow-none sm:w-auto"
                disabled={!canSubmit || isPending}
                onClick={() => handleSubmit('draft')}
              >
                <FileTextIcon className="size-3.5" strokeWidth={1.75} />
                Save draft
              </Button>

              <Button
                type="button"
                size="sm"
                className="h-9 w-full rounded-full px-4 text-xs font-medium shadow-xs sm:w-auto"
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
