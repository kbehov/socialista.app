'use client'

import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
import { StudioHomeBelowSection } from '@/components/studio/studio-home-below-section'
import { StudioHomeComposerSection } from '@/components/studio/studio-home-composer-section'
import { StudioHomeCreateButton } from '@/components/studio/studio-home-hero-actions'
import { StudioHomePromptExtras } from '@/components/studio/studio-home-prompt-extras'
import { VideoStudioProvider } from '@/components/studio/videos/video-studio-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import type { Model, StudioTemplateCategoryDto, VideoSummaryResponse } from '@socialista/types'
import { ClockIcon, LayoutTemplateIcon } from 'lucide-react'
import { VideoGrid } from './video-grid'
import VideoGenerationPromptInput from './video-prompt-input'
import { VideoTemplatesGallery } from './video-templates-gallery'

const STUDIO_TAB_TRIGGER_CLASS = cn(
  'h-8 flex-none rounded-full px-3.5',
  'text-[13px] font-medium tracking-[-0.015em]',
  'text-black/52 hover:text-foreground',
  'data-active:bg-white data-active:text-foreground',
  'data-active:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]',
  'transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
  'active:scale-[0.96] motion-reduce:active:scale-100 motion-reduce:transition-none',
  'dark:text-white/52 dark:data-active:bg-white/10 dark:data-active:shadow-none',
)

type VideoStudioWorkspaceProps = {
  models: Model[]
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
  initialTotal?: number
  initialAttachmentUrl?: string
  templateCategories: StudioTemplateCategoryDto[]
}

export function VideoStudioWorkspace({
  models,
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
  initialTotal,
  initialAttachmentUrl,
  templateCategories,
}: VideoStudioWorkspaceProps) {
  const recentCount = initialTotal ?? initialVideos.length

  return (
    <VideoStudioProvider>
      <div className={imageStudioHomeRootClassName}>
        <StudioHomeComposerSection
          id="video-studio-composer"
          ariaLabel="Create a video"
          title="What are we filming today?"
          description="Describe the motion and mood — attach a product or creator with @image1."
          contentMaxWidth="roomy"
          toolbar={<StudioHomeCreateButton href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE} label="New project" />}
          footer={<StudioHomePromptExtras />}
        >
          <VideoGenerationPromptInput initialAttachmentUrl={initialAttachmentUrl} models={models} />
        </StudioHomeComposerSection>

        <StudioHomeBelowSection ariaLabel="Templates and recent videos" className="max-w-6xl">
          <Tabs defaultValue="templates" className="w-full gap-6">
            <TabsList className="mx-auto h-9 w-fit gap-0.5 self-center rounded-full bg-black/[0.04] p-0.5 ring-1 ring-inset ring-black/[0.06] dark:bg-white/[0.05] dark:ring-white/10">
              <TabsTrigger value="templates" className={STUDIO_TAB_TRIGGER_CLASS}>
                <LayoutTemplateIcon className="size-3.5" strokeWidth={1.75} />
                Templates
              </TabsTrigger>
              <TabsTrigger value="recent" className={STUDIO_TAB_TRIGGER_CLASS}>
                <ClockIcon className="size-3.5" strokeWidth={1.75} />
                Recent
                {recentCount > 0 ? (
                  <span className="tabular-nums text-[12px] text-current/45">{recentCount}</span>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-0 outline-none">
              <VideoTemplatesGallery models={models} templateCategories={templateCategories} />
            </TabsContent>

            <TabsContent value="recent" className="mt-0 outline-none">
              <VideoGrid
                workspaceId={workspaceId}
                initialVideos={initialVideos}
                initialError={initialError}
                initialHasMore={initialHasMore}
                initialTotal={initialTotal}
              />
            </TabsContent>
          </Tabs>
        </StudioHomeBelowSection>
      </div>
    </VideoStudioProvider>
  )
}
