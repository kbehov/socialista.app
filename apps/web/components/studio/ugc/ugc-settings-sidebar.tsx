'use client'

import { UgcAssetsPanel } from '@/components/studio/ugc/ugc-assets-panel'
import { UgcCampaignPresets } from '@/components/studio/ugc/ugc-campaign-presets'
import { UgcInfluencerPicker } from '@/components/studio/ugc/ugc-influencer-picker'
import { UgcProductInput, type UgcProductChange } from '@/components/studio/ugc/ugc-product-input'
import { UgcVoiceDialog } from '@/components/studio/ugc/ugc-voice-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { hasUgcProduct, ugcNeedsCreator } from '@/lib/studio/ugc/ugc-stage'
import { cn } from '@/lib/utils'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import {
  UGC_PRODUCT_KIND_LABELS,
  parseUgcProductKind,
  ugcResolvedClipVoice,
  type UgcCampaignPresetId,
  type UgcClip,
  type UgcClipVoice,
  type UgcProductKind,
  type UgcProject,
} from '@socialista/types'
import { ChevronRightIcon, PackageIcon, UserRoundIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

const ASPECT_RATIOS = ['9:16', '1:1', '16:9'] as const

type UgcSettingsSidebarProps = {
  workspaceId: string
  project: UgcProject
  clip?: UgcClip
  createHref: string
  creatorOpen?: boolean
  applyingPreset?: boolean
  busy?: boolean
  className?: string
  onClose?: () => void
  onCreatorOpenChange?: (open: boolean) => void
  onProductChange: (next: UgcProductChange) => void
  onCampaignInfluencerChange: (ids: string[]) => void
  onCampaignVoiceChange: (voice: UgcClipVoice) => void
  onAspectRatioChange: (ratio: string) => void
  onApplyPreset: (presetId: UgcCampaignPresetId) => void
  onApplyAssetImage: (url: string) => void
  onApplyAssetAudio: (url: string) => void
}

export function UgcSettingsSidebar({
  workspaceId,
  project,
  clip,
  createHref,
  creatorOpen,
  applyingPreset,
  busy,
  className,
  onClose,
  onCreatorOpenChange,
  onProductChange,
  onCampaignInfluencerChange,
  onCampaignVoiceChange,
  onAspectRatioChange,
  onApplyPreset,
  onApplyAssetImage,
  onApplyAssetAudio,
}: UgcSettingsSidebarProps) {
  return (
    <aside
      className={cn(
        'flex min-h-0 w-full shrink-0 flex-col border-t border-black/[0.06] bg-background dark:border-white/[0.08] lg:w-[280px] lg:border-t-0 lg:border-l',
        className,
      )}
    >
      <Tabs defaultValue="campaign" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="flex h-10 shrink-0 items-end gap-1 border-b border-black/[0.06] px-3 dark:border-white/[0.08]">
          <TabsList variant="line" className="h-9 min-w-0 flex-1 [&_[data-slot=tabs-trigger]]:after:hidden">
            <TabsTrigger value="campaign" className="text-[12.5px]">
              Campaign
            </TabsTrigger>
            <TabsTrigger value="assets" className="text-[12.5px]">
              Assets
            </TabsTrigger>
          </TabsList>
          {onClose ? (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="mb-1 text-muted-foreground lg:hidden"
              aria-label="Close campaign settings"
              onClick={onClose}
            >
              <XIcon className="size-3.5" />
            </Button>
          ) : null}
        </div>
        <TabsContent value="campaign" className="min-h-0 overflow-y-auto">
          <CampaignTab
            workspaceId={workspaceId}
            project={project}
            createHref={createHref}
            creatorOpen={creatorOpen}
            applyingPreset={applyingPreset}
            onCreatorOpenChange={onCreatorOpenChange}
            onProductChange={onProductChange}
            onInfluencerChange={onCampaignInfluencerChange}
            onVoiceChange={onCampaignVoiceChange}
            onAspectRatioChange={onAspectRatioChange}
            onApplyPreset={onApplyPreset}
          />
        </TabsContent>
        <TabsContent value="assets" className="min-h-0 overflow-y-auto px-3 py-3">
          <UgcAssetsPanel
            workspaceId={workspaceId}
            project={project}
            clip={clip}
            busy={busy}
            onApplyImage={onApplyAssetImage}
            onApplyAudio={onApplyAssetAudio}
          />
        </TabsContent>
      </Tabs>
    </aside>
  )
}

function PropertyRow({
  label,
  empty,
  onClick,
  children,
}: {
  label: string
  empty?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-muted/60"
    >
      <span className="w-[68px] shrink-0 text-[12px] text-muted-foreground">{label}</span>
      <span className={cn('min-w-0 flex-1 overflow-hidden', empty && 'text-muted-foreground')}>{children}</span>
      <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
    </button>
  )
}

function CampaignTab({
  workspaceId,
  project,
  createHref,
  creatorOpen,
  applyingPreset,
  onCreatorOpenChange,
  onProductChange,
  onInfluencerChange,
  onVoiceChange,
  onAspectRatioChange,
  onApplyPreset,
}: {
  workspaceId: string
  project: UgcProject
  createHref: string
  creatorOpen?: boolean
  applyingPreset?: boolean
  onCreatorOpenChange?: (open: boolean) => void
  onProductChange: (next: UgcProductChange) => void
  onInfluencerChange: (ids: string[]) => void
  onVoiceChange: (voice: UgcClipVoice) => void
  onAspectRatioChange: (ratio: string) => void
  onApplyPreset: (presetId: UgcCampaignPresetId) => void
}) {
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const [productOpen, setProductOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [localCreatorOpen, setLocalCreatorOpen] = useState(false)
  const creatorDialogOpen = creatorOpen ?? localCreatorOpen
  const setCreatorDialogOpen = onCreatorOpenChange ?? setLocalCreatorOpen
  const productKind = parseUgcProductKind(project.productKind)
  const hasProduct = hasUgcProduct(project)
  const productThumb = project.productImageUrls[0]
  const creator = project.influencerId ? influencersById[project.influencerId] : undefined
  const creatorSrc = creator?.coverImageUrl || creator?.galleryImageUrls[0]
  const needsCreator = ugcNeedsCreator(project)
  const voice = ugcResolvedClipVoice(project)

  return (
    <div className="px-3 py-2">
      <PropertyRow label="Product" empty={!hasProduct} onClick={() => setProductOpen(true)}>
        {hasProduct ? (
          <span className="flex items-center gap-2">
            <span className="relative size-5 shrink-0 overflow-hidden rounded bg-muted">
              {productThumb ? (
                <Image alt="" className="object-cover" fill sizes="20px" src={productThumb} unoptimized />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <PackageIcon className="size-3" strokeWidth={1.5} />
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px]">{project.productName?.trim() || 'Untitled product'}</span>
              {productKind ? (
                <span className="block truncate text-[11px] text-muted-foreground">
                  {UGC_PRODUCT_KIND_LABELS[productKind]}
                </span>
              ) : null}
            </span>
          </span>
        ) : (
          <span className="text-[13px]">Add a product</span>
        )}
      </PropertyRow>

      <PropertyRow label="Creator" empty={!creator} onClick={() => setCreatorDialogOpen(true)}>
        {creator ? (
          <span className="flex items-center gap-2">
            <span className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted">
              {creatorSrc ? (
                <Image alt="" className="object-cover" fill sizes="20px" src={creatorSrc} unoptimized />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <UserRoundIcon className="size-3" strokeWidth={1.5} />
                </span>
              )}
            </span>
            <span className="truncate text-[13px]">{creator.name}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-[13px]">
            Pick a creator
            {needsCreator ? <span className="text-[11px] text-amber-600 dark:text-amber-400">Required</span> : null}
          </span>
        )}
      </PropertyRow>
      <UgcInfluencerPicker
        workspaceId={workspaceId}
        selectedIds={project.influencerId ? [project.influencerId] : []}
        createHref={createHref}
        dialogOnly
        max={1}
        open={creatorDialogOpen}
        onOpenChange={setCreatorDialogOpen}
        onChange={onInfluencerChange}
      />

      <PropertyRow label="Voice" empty={!voice.voiceName} onClick={() => setVoiceOpen(true)}>
        <span className="block truncate text-[13px]" title={voice.voiceName}>
          {voice.voiceName ?? 'Choose a voice'}
        </span>
      </PropertyRow>
      <UgcVoiceDialog open={voiceOpen} value={voice} onOpenChange={setVoiceOpen} onSelect={onVoiceChange} />

      <div className="flex items-center gap-3 px-1 py-1.5">
        <span className="w-[68px] shrink-0 text-[12px] text-muted-foreground">Format</span>
        <div className="flex min-w-0 flex-1 gap-0.5 rounded-md bg-muted/70 p-0.5" role="radiogroup" aria-label="Aspect ratio">
          {ASPECT_RATIOS.map(ratio => (
            <button
              key={ratio}
              type="button"
              role="radio"
              aria-checked={project.aspectRatio === ratio}
              onClick={() => onAspectRatioChange(ratio)}
              className={cn(
                'h-6 flex-1 rounded-[5px] text-[11px] font-medium tabular-nums transition-colors',
                project.aspectRatio === ratio
                  ? 'bg-background text-foreground shadow-sm dark:bg-background/80'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 px-1">
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-full justify-start px-1 text-[12px] text-muted-foreground"
          onClick={() => setPresetOpen(true)}
        >
          Start from a template
        </Button>
        <UgcCampaignPresets
          open={presetOpen}
          applying={applyingPreset}
          onOpenChange={setPresetOpen}
          onApply={presetId => {
            onApplyPreset(presetId)
            setPresetOpen(false)
          }}
        />
      </div>

      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Product</DialogTitle>
            <DialogDescription>Paste a link, drop a photo, or describe it.</DialogDescription>
          </DialogHeader>
          <UgcProductInput
            workspaceId={workspaceId}
            imageUrls={project.productImageUrls}
            productName={project.productName}
            productId={project.productId}
            productDescription={project.productDescription}
            productUrl={project.productUrl}
            productKind={project.productKind as UgcProductKind | undefined}
            embedded
            onChange={onProductChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
