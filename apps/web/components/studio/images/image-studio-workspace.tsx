'use client'

import {
  IMAGE_STUDIO_HOME_SCROLL_ID,
  imageStudioHomeRootClassName,
} from '@/components/dashboard/studio-shell'
import { ImageGenerationHistory } from '@/components/studio/images/image-generation-history'
import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import ImageGenerationPromptInput from '@/components/studio/images/prompt-input'
import { ImageTemplatesGallery } from '@/components/studio/images/image-templates-gallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Model, StudioTemplateCategoryDto } from '@socialista/types'
import { useMemo, useState } from 'react'

type ImageStudioWorkspaceProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
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

function ImageStudioWorkspaceBody({ models, templateCategories }: ImageStudioWorkspaceProps) {
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
              <ImageTemplatesGallery
                models={models}
                templateCategories={templateCategories}
                hideTitle
                pinCategoryBar
                scrollTargetId={IMAGE_STUDIO_HOME_SCROLL_ID}
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 flex-1 outline-none">
            <div className={TAB_CONTENT_CLASS}>
              <ImageGenerationHistory
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
        <div className="image-studio-composer-dock__content">
          <ImageGenerationPromptInput models={models} />
        </div>
      </div>
    </div>
  )
}

export function ImageStudioWorkspace({ models, templateCategories }: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <ImageStudioWorkspaceBody models={models} templateCategories={templateCategories} />
    </ImageStudioProvider>
  )
}
