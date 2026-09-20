'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import { UgcClipRail } from '@/components/studio/ugc/ugc-clip-rail'
import { UgcPlanDialog } from '@/components/studio/ugc/ugc-plan-dialog'
import { UgcPlanSheet } from '@/components/studio/ugc/ugc-plan-sheet'
import { UgcRunWatcher } from '@/components/studio/ugc/ugc-run-watcher'
import { UgcSceneWorkbench } from '@/components/studio/ugc/ugc-scene-workbench'
import { UgcSettingsSidebar } from '@/components/studio/ugc/ugc-settings-sidebar'
import { UgcStudioTour } from '@/components/studio/ugc/ugc-studio-tour'
import { UgcStudioTopbar } from '@/components/studio/ugc/ugc-studio-topbar'
import { useUgcProjectWorkspace } from '@/hooks/ugc/use-ugc-project-workspace'
import { cn } from '@/lib/utils'
import type { UgcProject } from '@socialista/types'
import { Suspense } from 'react'

type UgcProjectWorkspaceProps = {
  workspaceId: string
  initialProject: UgcProject
}

export function UgcProjectWorkspace(props: UgcProjectWorkspaceProps) {
  return (
    <Suspense fallback={<div className="flex-1 bg-background" />}>
      <UgcStudioTour>
        <UgcProjectWorkspaceInner {...props} />
      </UgcStudioTour>
    </Suspense>
  )
}

function UgcProjectWorkspaceInner(props: UgcProjectWorkspaceProps) {
  const ws = useUgcProjectWorkspace(props)

  return (
    <div className="ugc-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <CollapseAppSidebarOnMount />

      {ws.activeRuns.map(run => (
        <UgcRunWatcher
          key={run.key}
          runId={run.runId}
          accessToken={run.accessToken}
          onProgress={(progress, label) => ws.updateRunProgress(run.key, progress, label)}
          onSettled={() => ws.handleRunWatcherSettled(run)}
        />
      ))}

      <UgcStudioTopbar
        name={ws.project.name}
        status={ws.project.status}
        aspectRatio={ws.project.aspectRatio}
        sceneCount={ws.project.clips.length}
        totalDurationSec={ws.totalDurationSec}
        finishing={ws.openingProjectEditor}
        canFinish={ws.allScenesReady && !ws.anyGenerating}
        editorPrepared={Boolean(ws.project.composedProjectVideoId)}
        settingsIncomplete={ws.settingsIncomplete}
        onNameChange={ws.handleNameChange}
        onFinish={ws.handleOpenEditor}
        onOpenSettings={() => ws.setSettingsOpen(true)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <UgcClipRail
          project={ws.project}
          selectedId={ws.selectedClipId}
          creating={ws.creatingScenes}
          applyingPreset={ws.applyingPreset}
          runsByClipId={ws.runsByClipId}
          onSelect={ws.setSelectedClipId}
          onAdd={type => void ws.handleCreateClip(type)}
          onUseStarter={ws.handleStarterSequence}
          onDuplicate={ws.handleDuplicateClip}
          onDelete={ws.handleDeleteClip}
          onExtend={clipId => {
            const clip = ws.project.clips.find(item => item.id === clipId)
            if (clip) ws.handleExtendClip(clip)
          }}
          extendingClipId={ws.extendingClipId}
          onReorder={ws.handleReorderClips}
          onApplyPreset={ws.handleApplyPreset}
          onPlan={ws.openPlanDialog}
        />
        <UgcSceneWorkbench
          project={ws.project}
          clip={ws.selectedClip}
          tab={ws.activeTab}
          videoAttachments={ws.videoAttachments}
          creatingScenes={ws.creatingScenes}
          writingScript={ws.writingScript}
          generatingAudio={ws.generatingAudio}
          generatingStill={ws.generatingStill}
          generatingVideo={ws.generatingVideo}
          stillsProgress={ws.clipRun?.progress ?? ws.stillsRun?.progress}
          stillsProgressLabel={ws.clipRun?.label ?? ws.stillsRun?.progressLabel}
          videoProgress={ws.videoRun?.progress}
          videoProgressLabel={ws.videoRun?.progressLabel}
          busy={ws.openingProjectEditor}
          onTabChange={ws.setActiveTab}
          onTypeChange={type => {
            if (!ws.selectedClip) return
            void ws.patchClip(ws.selectedClip.id, { type })
          }}
          onAddClip={type => void ws.handleCreateClip(type)}
          onUseStarter={ws.handleStarterSequence}
          onPlan={ws.openPlanDialog}
          onImageSubmit={result => {
            if (!ws.selectedClip) return
            ws.handleImageSubmit(ws.selectedClip, result)
          }}
          onVideoSubmit={result => {
            if (!ws.selectedClip) return
            ws.handleVideoSubmit(ws.selectedClip, result)
          }}
          onUseStills={ws.applyStillUrls}
          onSelectAudio={ws.applyClipAudio}
          onSelectVideo={ws.applyClipVideo}
          onExtend={() => {
            if (!ws.selectedClip) return
            ws.handleExtendClip(ws.selectedClip)
          }}
          extending={ws.extendingClipId === ws.selectedClip?.id}
          onScriptChange={ws.handleScriptChange}
          onWriteScript={ws.handleWriteScript}
          onVoiceChange={ws.handleVoiceChange}
          onGenerateAudio={ws.handleGenerateClipAudio}
        />
        {ws.settingsOpen ? (
          <button
            type="button"
            aria-label="Close campaign settings"
            className="fixed inset-0 z-40 bg-black/25 lg:hidden dark:bg-black/45"
            onClick={() => ws.setSettingsOpen(false)}
          />
        ) : null}
        <UgcSettingsSidebar
          workspaceId={ws.workspaceId}
          project={ws.project}
          clip={ws.selectedClip}
          createHref={ws.createHref}
          creatorOpen={ws.creatorOpen}
          applyingPreset={ws.applyingPreset}
          busy={ws.generatingStill || ws.generatingVideo}
          className={cn(
            'max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-[min(100%,20rem)] max-lg:border-t-0 max-lg:border-l max-lg:shadow-xl',
            !ws.settingsOpen && 'max-lg:hidden',
          )}
          onClose={() => ws.setSettingsOpen(false)}
          onCreatorOpenChange={ws.setCreatorOpen}
          onProductChange={next => {
            ws.patchProjectLocal({
              productImageUrls: next.imageUrls,
              productName: next.productName,
              productId: next.productId ?? undefined,
              productDescription: next.productDescription,
              productUrl: next.productUrl ?? undefined,
              productKind: next.productKind ?? undefined,
            })
            ws.scheduleProjectPatch('product', {
              productImageUrls: next.imageUrls,
              productName: next.productName,
              productId: next.productId,
              productDescription: next.productDescription ?? null,
              productUrl: next.productUrl ?? null,
              productKind: next.productKind ?? null,
            })
          }}
          onCampaignInfluencerChange={ids => {
            void ws.patchProject({ influencerId: ids[0] ?? null })
          }}
          onCampaignVoiceChange={voice => {
            void ws.persistCampaignVoice(voice, ws.selectedClip?.id)
          }}
          onAspectRatioChange={ratio => {
            void ws.patchProject({ aspectRatio: ratio })
          }}
          onApplyPreset={ws.handleApplyPreset}
          onApplyAssetImage={ws.applyAssetImage}
          onApplyAssetAudio={ws.applyClipAudio}
        />
      </div>

      <UgcPlanDialog
        open={ws.planDialogOpen}
        project={ws.project}
        workspaceId={ws.workspaceId}
        createHref={ws.createHref}
        pending={ws.planning}
        onOpenChange={ws.setPlanDialogOpen}
        onSubmit={ws.handlePlanSubmit}
      />
      <UgcPlanSheet
        open={ws.planSheetOpen}
        planning={ws.planning}
        building={ws.buildingPlan}
        plan={ws.plan}
        error={ws.planError}
        onOpenChange={ws.setPlanSheetOpen}
        onBuild={ws.handleBuildPlan}
      />
    </div>
  )
}
