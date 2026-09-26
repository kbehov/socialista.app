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
import { hasUgcProduct, ugcNeedsCreator, ugcProjectHasGeneratedSceneWork } from '@/lib/studio/ugc/ugc-stage'
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
import {
  ChevronRightIcon,
  LayoutTemplateIcon,
  MicIcon,
  PackageIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

const ASPECT_RATIOS = ['9:16', '1:1', '16:9'] as const

const SIDEBAR_SCROLL =
  'min-h-0 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.12)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.12)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10'

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
      id="ugc-tour-settings"
      className={cn(
        'flex min-h-0 w-full shrink-0 flex-col border-t border-black/[0.06] bg-background dark:border-white/[0.08] lg:w-[268px] lg:border-t-0 lg:border-l',
        className,
      )}
    >
      <Tabs defaultValue="campaign" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="flex h-10 shrink-0 items-center gap-1 border-b border-black/[0.06] px-2 dark:border-white/[0.08]">
          <TabsList
            variant="line"
            className="h-9 min-w-0 flex-1 gap-0.5 px-1 [&_[data-slot=tabs-trigger]]:h-8 [&_[data-slot=tabs-trigger]]:px-2.5 [&_[data-slot=tabs-trigger]]:text-[12px] [&_[data-slot=tabs-trigger]]:font-medium [&_[data-slot=tabs-trigger]]:tracking-[-0.01em] [&_[data-slot=tabs-trigger]]:after:bottom-[-4px]"
          >
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>
          {onClose ? (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="shrink-0 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Close campaign settings"
              onClick={onClose}
            >
              <XIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
          ) : null}
        </div>

        <TabsContent value="campaign" className={cn('mt-0 flex-1', SIDEBAR_SCROLL)}>
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

        <TabsContent value="assets" className={cn('mt-0 flex-1 px-3 py-3', SIDEBAR_SCROLL)}>
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
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left outline-none transition-colors duration-150',
        'hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-inset',
      )}
    >
      <span className="w-[62px] shrink-0 text-[11px] font-medium leading-none text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 overflow-hidden text-[13px] leading-snug tracking-[-0.01em]',
          empty && 'text-muted-foreground',
        )}
      >
        {children}
      </span>
      <ChevronRightIcon
        className="size-3.5 shrink-0 text-muted-foreground/35 transition-colors duration-150 group-hover:text-muted-foreground"
        strokeWidth={1.75}
      />
    </button>
  )
}

function PropertyAvatar({
  src,
  alt = '',
  rounded = 'rounded-md',
  fallback,
}: {
  src?: string
  alt?: string
  rounded?: string
  fallback: ReactNode
}) {
  return (
    <span
      className={cn(
        'relative size-6 shrink-0 overflow-hidden bg-muted ring-1 ring-black/[0.06] dark:ring-white/[0.08]',
        rounded,
      )}
    >
      {src ? (
        <Image alt={alt} className="object-cover" fill sizes="24px" src={src} unoptimized />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {fallback}
        </span>
      )}
    </span>
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
    <div className="px-2 py-2.5">
      <p className="px-2 pb-1 text-[11px] font-medium leading-none tracking-[-0.01em] text-muted-foreground">
        Setup
      </p>

      <div className="space-y-0.5">
        <PropertyRow label="Product" empty={!hasProduct} onClick={() => setProductOpen(true)}>
          {hasProduct ? (
            <span className="flex items-center gap-2">
              <PropertyAvatar
                src={productThumb}
                fallback={<PackageIcon className="size-3.5" strokeWidth={1.5} />}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {project.productName?.trim() || 'Untitled product'}
                </span>
                {productKind ? (
                  <span className="mt-0.5 block truncate text-[11px] leading-none text-muted-foreground">
                    {UGC_PRODUCT_KIND_LABELS[productKind]}
                  </span>
                ) : null}
              </span>
            </span>
          ) : (
            'Add a product'
          )}
        </PropertyRow>

        <PropertyRow label="Creator" empty={!creator} onClick={() => setCreatorDialogOpen(true)}>
          {creator ? (
            <span className="flex items-center gap-2">
              <PropertyAvatar
                src={creatorSrc}
                rounded="rounded-full"
                fallback={<UserRoundIcon className="size-3.5" strokeWidth={1.5} />}
              />
              <span className="truncate font-medium">{creator.name}</span>
            </span>
          ) : (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Pick a creator</span>
              {needsCreator ? (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-700 dark:text-amber-400">
                  Required
                </span>
              ) : null}
            </span>
          )}
        </PropertyRow>

        <PropertyRow label="Voice" empty={!voice.voiceName} onClick={() => setVoiceOpen(true)}>
          <span className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
              <MicIcon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium" title={voice.voiceName}>
                {voice.voiceName ?? 'Choose a voice'}
              </span>
              <span className="mt-0.5 block truncate text-[11px] leading-none text-muted-foreground">
                Campaign voice
              </span>
            </span>
          </span>
        </PropertyRow>
      </div>

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
      <UgcVoiceDialog open={voiceOpen} value={voice} onOpenChange={setVoiceOpen} onSelect={onVoiceChange} />

      <div className="mt-3 border-t border-black/[0.06] px-2 pt-3 dark:border-white/[0.08]">
        <p className="pb-1.5 text-[11px] font-medium leading-none tracking-[-0.01em] text-muted-foreground">
          Format
        </p>
        <div
          className="flex gap-0.5 rounded-lg bg-muted/60 p-0.5 ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
          role="radiogroup"
          aria-label="Aspect ratio"
        >
          {ASPECT_RATIOS.map(ratio => {
            const active = project.aspectRatio === ratio
            return (
              <button
                key={ratio}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onAspectRatioChange(ratio)}
                className={cn(
                  'h-7 flex-1 rounded-[6px] text-[11px] font-medium tabular-nums tracking-[-0.01em] transition-[background-color,color,box-shadow] duration-150',
                  active
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-black/[0.06] dark:bg-background/90 dark:ring-white/[0.08]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {ratio}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 px-2">
        <button
          type="button"
          onClick={() => setPresetOpen(true)}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-[10px] border border-dashed border-black/[0.08] px-2.5 py-2.5 text-left outline-none transition-colors duration-150',
            'hover:border-black/[0.12] hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-white/[0.1] dark:hover:border-white/[0.14]',
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <LayoutTemplateIcon className="size-3.5" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-medium leading-snug tracking-[-0.01em]">
              Start from a template
            </span>
            <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
              Replace scenes with a preset ad structure
            </span>
          </span>
          <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground/35" strokeWidth={1.75} />
        </button>

        <UgcCampaignPresets
          open={presetOpen}
          applying={applyingPreset}
          hasGeneratedWork={ugcProjectHasGeneratedSceneWork(project)}
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
