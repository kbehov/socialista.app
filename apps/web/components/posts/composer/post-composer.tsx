'use client'

import { usePostComposerActions, usePostComposerStore } from '@/store/post-composer.store'
import { useProjectStore } from '@/store/project.store'
import { ConnectionStatus, type AccountSummary } from '@socialista/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { LoadingState } from '@/components/common/loading-state'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { usePostComposerSubmit } from '@/hooks/use-post-composer-submit'
import {
  importSlideshowToComposer,
  type SlideshowComposerImportProgress,
} from '@/lib/carousel/slideshow-to-composer'
import { cn } from '@/lib/utils'
import { fetchSlideshow } from '@/services/slideshow.client'
import type { ComposerMediaItem } from '@/types/composer-types'
import { getAccountsWithIssues, getDefaultTimezone } from '@/utils/composer.utils'

import { AccountSelector } from './account-selector'
import { ComposerEditor } from './composer-editor'
import { ComposerHeader } from './composer-header'
import { PlatformRequirementsBanner } from './platform-requirements-banner'
import { PlatformVariantsPanel } from './platform-variants-panel'
import { PostPreviewBar } from './post-preview-bar'
import { SchedulePanel } from './schedule-panel'

type PostComposerProps = {
  workspaceId: string
  accounts: AccountSummary[]
  accountsTotal?: number
  initialMedia?: ComposerMediaItem[]
  slideshowId?: string
}

function formatSlideshowImportMessage(progress: SlideshowComposerImportProgress | null): string {
  if (!progress) return 'Importing slideshow…'

  const label =
    progress.phase === 'persisting'
      ? 'Saving images'
      : progress.phase === 'rendering'
        ? 'Rendering slides'
        : 'Uploading slides'
  return `${label} (${progress.current}/${progress.total})`
}

export function PostComposer({
  workspaceId,
  accounts,
  accountsTotal,
  initialMedia = [],
  slideshowId,
}: PostComposerProps) {
  const router = useRouter()
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [slideshowImportReady, setSlideshowImportReady] = useState(!slideshowId)
  const [slideshowImportProgress, setSlideshowImportProgress] =
    useState<SlideshowComposerImportProgress | null>(null)
  const slideshowImportedRef = useRef(false)

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
  const projectTimezone = useProjectStore(s => s.currentProject?.timezone)

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
    hydrate(workspaceId, getDefaultTimezone(connectedAccounts, [], projectTimezone), initialMedia)
    return () => reset()
    // Reset/hydrate only when the workspace changes — not when the account list identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, hydrate, reset])

  useEffect(() => {
    if (!slideshowId || slideshowImportedRef.current) {
      setSlideshowImportReady(true)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    async function importSlideshow() {
      setSlideshowImportReady(false)
      setSlideshowImportProgress(null)

      try {
        const response = await fetchSlideshow(slideshowId!, { signal: controller.signal })
        if (cancelled || controller.signal.aborted) return

        if (!response.success || !response.data?.slideshow) {
          toast.error(response.message ?? 'Slideshow not found')
          setSlideshowImportReady(true)
          router.replace(DASHBOARD_ROUTES.createPost())
          return
        }

        const items = await importSlideshowToComposer(workspaceId, response.data.slideshow, {
          onProgress: progress => {
            if (!cancelled && !controller.signal.aborted) {
              setSlideshowImportProgress(progress)
            }
          },
        })
        if (cancelled || controller.signal.aborted) return

        if (items.length === 0) {
          toast.error('Slideshow has no slides to import')
          setSlideshowImportReady(true)
          router.replace(DASHBOARD_ROUTES.createPost())
          return
        }

        for (const item of items) {
          addMedia(item)
        }

        slideshowImportedRef.current = true
        router.replace(DASHBOARD_ROUTES.createPost())
        setSlideshowImportReady(true)
        setSlideshowImportProgress(null)
        toast.success(`Added ${items.length} slide${items.length === 1 ? '' : 's'} to post`)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Failed to import slideshow'
        toast.error(message)
        setSlideshowImportReady(true)
        router.replace(DASHBOARD_ROUTES.createPost())
      }
    }

    void importSlideshow()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [addMedia, router, slideshowId, workspaceId])

  useEffect(() => {
    if (selectedAccountIds.length !== 1) return
    const timezone = getDefaultTimezone(connectedAccounts, selectedAccountIds, projectTimezone)
    if (timezone && timezone !== schedule.timezone) {
      setSchedule({ timezone })
    }
  }, [selectedAccountIds, connectedAccounts, projectTimezone, schedule.timezone, setSchedule])

  const selectedProviders = useMemo(
    () =>
      connectedAccounts
        .filter(account => selectedAccountIds.includes(account._id))
        .map(account => account.provider),
    [connectedAccounts, selectedAccountIds],
  )

  const {
    validationIssues,
    hasContent,
    hasMedia,
    canSubmit,
    isReady,
    statusMessage,
    isPending,
    handleSubmit,
  } = usePostComposerSubmit({
    workspaceId,
    connectedAccounts,
    selectedAccountIds,
    commonCaption,
    media,
    variants,
    schedule,
    previewAccountId,
  })

  const accountsWithIssues = useMemo(() => getAccountsWithIssues(validationIssues), [validationIssues])

  const previewBarProps = {
    accounts: connectedAccounts,
    selectedAccountIds,
    previewAccountId,
    commonCaption,
    media,
    variants,
    onPreviewAccountChange: setPreviewAccountId,
  }

  if (!slideshowImportReady) {
    const progressPercent =
      slideshowImportProgress && slideshowImportProgress.total > 0
        ? Math.round((slideshowImportProgress.current / slideshowImportProgress.total) * 100)
        : null

    return (
      <LoadingState
        message={formatSlideshowImportMessage(slideshowImportProgress)}
        className="flex-1 items-center justify-center px-4 py-16"
      >
        {progressPercent !== null ? (
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}
      </LoadingState>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ComposerHeader
        canSubmit={canSubmit && storeWorkspaceId === workspaceId}
        isSubmitting={isPending}
        isReady={isReady && storeWorkspaceId === workspaceId}
        statusMessage={statusMessage}
        scheduleMode={schedule.mode}
        onSaveDraft={() => handleSubmit(true)}
        onPublish={() => handleSubmit(false)}
      />

      <div
        className={cn(
          'grid min-h-0 flex-1 gap-5 pt-2',
          'transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none',
          previewCollapsed
            ? 'lg:grid-cols-[minmax(0,1fr)_2.25rem]'
            : 'lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]',
        )}
      >
        <ScrollArea className="min-h-0" scrollFade scrollbarGutter>
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3.5 pb-28 sm:gap-4 sm:pb-10 lg:mx-0 lg:max-w-none lg:pb-8">
            <AccountSelector
              workspaceId={workspaceId}
              accounts={connectedAccounts}
              accountsTotal={accountsTotal}
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

            <div className="flex flex-col gap-3.5 sm:gap-4">
              <SchedulePanel schedule={schedule} onChange={setSchedule} />

              <PlatformVariantsPanel
                accounts={connectedAccounts}
                selectedAccountIds={selectedAccountIds}
                commonCaption={commonCaption}
                variants={variants}
                onVariantChange={setVariant}
                onClearField={clearVariantField}
              />
            </div>

            <div className="lg:hidden">
              <PostPreviewBar {...previewBarProps} />
            </div>
          </div>
        </ScrollArea>

        <div className="hidden min-h-0 lg:block">
          <div className="sticky top-16">
            <PostPreviewBar
              {...previewBarProps}
              collapsed={previewCollapsed}
              onCollapsedChange={setPreviewCollapsed}
              className="max-h-[calc(100vh-6.5rem)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
