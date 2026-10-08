'use client'

import {
  IMAGE_STUDIO_HOME_SCROLL_ID,
  imageStudioHomeRootClassName,
} from '@/components/dashboard/studio-shell'
import { StudioGenerationHistory } from '@/components/studio/studio-generation-history'
import { StaticAdFormatPresets } from '@/components/studio/static-ads/static-ad-format-presets'
import { StaticAdPromptInput } from '@/components/studio/static-ads/static-ad-prompt-input'
import { StaticAdStudioProvider } from '@/components/studio/static-ads/static-ad-studio-provider'
import { StaticAdTemplatesGallery } from '@/components/studio/static-ads/templates/static-ad-templates-gallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Model, StaticAdTemplateCategoryDto } from '@socialista/types'
import { useMemo, useState } from 'react'

type StaticAdStudioWorkspaceProps = {
  workspaceId: string
  models: Model[]
  templateCategories: StaticAdTemplateCategoryDto[]
}

const TAB_CONTENT_CLASS = 'mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8'

function TabCountBadge({ count }: { count: number | null }) {
  if (count === null || count <= 0) return null
  return (
    <span
      className={cn(
        'ml-1.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-md px-1',
        'text-[10px] font-medium tabular-nums leading-none text-muted-foreground/80',
      )}
    >
      {count > 999 ? '999+' : count}
    </span>
  )
}

function StaticAdStudioBody({
  workspaceId,
  models,
  templateCategories,
}: StaticAdStudioWorkspaceProps) {
  const exploreCount = useMemo(
    () => templateCategories.reduce((sum, category) => sum + category.templatesCount, 0),
    [templateCategories],
  )
  const [historyCount, setHistoryCount] = useState<number | null>(null)

  return (
    <div className={imageStudioHomeRootClassName}>
      <Tabs defaultValue="explore" className="flex min-h-0 flex-1 flex-col gap-0">
        <div
          className={cn(
            'shrink-0 z-30 border-b border-border/40 bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70',
          )}
        >
          <div className={cn(TAB_CONTENT_CLASS, 'flex justify-center pb-3 pt-4 sm:pt-5')}>
            <TabsList variant="line" className="h-9 gap-1">
              <TabsTrigger value="explore" className="px-3 text-[13px] tracking-[-0.02em]">
                Explore
                <TabCountBadge count={exploreCount} />
              </TabsTrigger>
              <TabsTrigger value="history" className="px-3 text-[13px] tracking-[-0.02em]">
                History
                <TabCountBadge count={historyCount} />
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div
          id={IMAGE_STUDIO_HOME_SCROLL_ID}
          data-dashboard-scroll
          className="sidebar-scrollbar flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-auto overscroll-y-contain"
        >
          <TabsContent value="explore" className="mt-0 flex-1 outline-none">
            <div className={TAB_CONTENT_CLASS}>
              <StaticAdTemplatesGallery
                exploreLayout
                models={models}
                workspaceId={workspaceId}
                initialCategories={templateCategories}
                scrollTargetId={IMAGE_STUDIO_HOME_SCROLL_ID}
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 flex-1 outline-none">
            <div className={TAB_CONTENT_CLASS}>
              <StudioGenerationHistory
                kind="static-ad"
                onTotalChange={setHistoryCount}
                scrollTargetId={IMAGE_STUDIO_HOME_SCROLL_ID}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="image-studio-composer-dock">
        <div aria-hidden className="image-studio-composer-dock__fade" />
        <div aria-hidden className="image-studio-composer-dock__blur" />
        <div className="image-studio-composer-dock__content space-y-3">
          <StaticAdFormatPresets compact />
          <StaticAdPromptInput models={models} workspaceId={workspaceId} hideExtras />
        </div>
      </div>
    </div>
  )
}

export function StaticAdStudioWorkspace(props: StaticAdStudioWorkspaceProps) {
  return (
    <StaticAdStudioProvider>
      <StaticAdStudioBody {...props} />
    </StaticAdStudioProvider>
  )
}
