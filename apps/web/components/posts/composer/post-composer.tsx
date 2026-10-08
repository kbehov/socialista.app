'use client'

import { usePostComposerActions, usePostComposerStore } from '@/store/post-composer.store'
import { useProjectStore } from '@/store/project.store'
import { ConnectionStatus, type AccountSummary } from '@socialista/types'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { postComposerRootClassName } from '@/components/dashboard/studio-shell'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
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

const PREVIEW_COLLAPSED_STORAGE_KEY = 'post-composer:preview-collapsed:v1'
const previewCollapsedListeners = new Set<() => void>()

type PostComposerProps = {
  workspaceId: string
  accounts: AccountSummary[]
  accountsTotal?: number
  initialMedia?: ComposerMediaItem[]
  slideshowId?: string
}

function readPreviewCollapsed(): boolean {
  try {
    return window.localStorage.getItem(PREVIEW_COLLAPSED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function subscribePreviewCollapsed(listener: () => void) {
  previewCollapsedListeners.add(listener)
  return () => {
    previewCollapsedListeners.delete(listener)
  }
}

function writePreviewCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(PREVIEW_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0')
  } catch {
    // Private browsing and quota failures should not block the toggle.
  }
  for (const listener of previewCollapsedListeners) listener()
}

function getPreviewCollapsedServerSnapshot() {
  return false
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
  const previewCollapsed = useSyncExternalStore(
    subscribePreviewCollapsed,
    readPreviewCollapsed,
    getPreviewCollapsedServerSnapshot,
  )
  const [previewCollapseMotion, setPreviewCollapseMotion] = useState(false)
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
  const isDirty = (hasContent || selectedAccountIds.length > 0) && !isPending
  const canPublish = isReady && storeWorkspaceId === workspaceId && !isPending
  const submitRef = useRef(handleSubmit)

  useEffect(() => {
    submitRef.current = handleSubmit
  }, [handleSubmit])

  useEffect(() => {
    // Enable the column transition after the stored collapse state has painted,
    // so restoring a collapsed preview does not animate on load.
    const frame = requestAnimationFrame(() => setPreviewCollapseMotion(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!slideshowImportReady) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat || event.isComposing) return
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
      if (!canPublish) return
      const target = event.target
      if (target instanceof Element && target.closest('[role="dialog"], [role="alertdialog"]')) return
      event.preventDefault()
      submitRef.current(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canPublish, slideshowImportReady])

  const handlePreviewCollapsedChange = (collapsed: boolean) => {
    writePreviewCollapsed(collapsed)
  }

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
      <div className={postComposerRootClassName} role="status" aria-live="polite" aria-busy="true">
        <div className="flex items-center justify-between gap-3 px-1 py-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </div>
          <Skeleton className="hidden h-8 w-28 rounded-full sm:block" />
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3.5 px-1 pt-2 lg:max-w-none">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="relative">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl bg-background/90 px-4 py-3 shadow-xs">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  {formatSlideshowImportMessage(slideshowImportProgress)}
                </p>
                {progressPercent !== null ? (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out motion-reduce:transition-none"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={postComposerRootClassName}>
      <ComposerHeader
        canSubmit={canSubmit && storeWorkspaceId === workspaceId}
        isSubmitting={isPending}
        isReady={isReady && storeWorkspaceId === workspaceId}
        isDirty={isDirty}
        statusMessage={statusMessage}
        scheduleMode={schedule.mode}
        onSaveDraft={() => handleSubmit(true)}
        onPublish={() => handleSubmit(false)}
      />

      <div
        className={cn(
          'grid min-h-0 flex-1 gap-5 pt-2',
          previewCollapseMotion &&
            'transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none',
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
              autoFocus
              onCaptionChange={setCommonCaption}
              onAddMedia={addMedia}
              onRemoveMedia={removeMedia}
              onReorderMedia={reorderMedia}
              onUpdateMediaAltText={updateMediaAltText}
            />

            <div className="lg:hidden">
              <PostPreviewBar {...previewBarProps} />
            </div>

            <div className="flex flex-col gap-3.5 sm:gap-4">
              <SchedulePanel
                schedule={schedule}
                onChange={setSchedule}
                accounts={connectedAccounts}
                selectedAccountIds={selectedAccountIds}
              />

              <PlatformVariantsPanel
                accounts={connectedAccounts}
                selectedAccountIds={selectedAccountIds}
                commonCaption={commonCaption}
                variants={variants}
                onVariantChange={setVariant}
                onClearField={clearVariantField}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="hidden min-h-0 lg:block">
          <div className="sticky top-0">
            <PostPreviewBar
              {...previewBarProps}
              collapsed={previewCollapsed}
              onCollapsedChange={handlePreviewCollapsedChange}
              className="max-h-[calc(100svh-var(--dashboard-chrome-height)-4.25rem)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
