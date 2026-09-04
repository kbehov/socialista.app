'use client'

import { UgcAddSceneMenu, UGC_SCENE_ICONS } from '@/components/studio/ugc/ugc-add-scene-menu'
import { UgcDurationControl } from '@/components/studio/ugc/ugc-duration-control'
import { UgcInfluencerPicker } from '@/components/studio/ugc/ugc-influencer-picker'
import { UgcModelChips } from '@/components/studio/ugc/ugc-model-chips'
import { UgcProductInput, type UgcProductChange } from '@/components/studio/ugc/ugc-product-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { hasUgcProduct, ugcNeedsCreator, ugcSceneBadge } from '@/lib/studio/ugc/ugc-stage'
import { cn } from '@/lib/utils'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcClip, UgcClipType, UgcProductKind, UgcProject } from '@socialista/types'
import {
  parseUgcProductKind,
  UGC_CLIP_TYPE_LABELS,
  UGC_MAX_CLIPS,
  UGC_PRODUCT_KIND_LABELS,
  UGC_SCRIPT_MAX_CHARS,
  ugcClipShowsScript,
  ugcResolvedClipModels,
  ugcScriptTargetChars,
} from '@socialista/types'
import { Loader2Icon, PackageIcon, SparklesIcon, Trash2Icon, UserRoundIcon } from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

const ASPECT_RATIOS = ['9:16', '1:1', '16:9', '4:3'] as const

type UgcConfigSidebarProps = {
  workspaceId: string
  project: UgcProject
  selectedClipId?: string
  creatingScenes?: boolean
  writingScript?: boolean
  createHref: string
  creatorOpen?: boolean
  onCreatorOpenChange?: (open: boolean) => void
  onSelectClip: (clipId: string) => void
  onAddClip: (type: UgcClipType) => void
  onUseStarter: () => void
  onDeleteClip: (clipId: string) => void
  onReorder: (clipIds: string[]) => void
  onProductChange: (next: UgcProductChange) => void
  onInfluencerChange: (ids: string[]) => void
  onScriptChange: (clipId: string, text: string) => void
  onWriteAll: (modelValue?: string) => void
  onModelsChange: (key: 'image' | 'script' | 'video', value: string) => void
  onDurationChange: (seconds: number) => void
  onAspectRatioChange: (ratio: string) => void
}

function SidebarSection({
  label,
  action,
  children,
}: {
  label: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3 border-b border-border/40 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">{label}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function UgcConfigSidebar({
  workspaceId,
  project,
  selectedClipId,
  creatingScenes,
  writingScript,
  createHref,
  creatorOpen,
  onCreatorOpenChange,
  onSelectClip,
  onAddClip,
  onUseStarter,
  onDeleteClip,
  onReorder,
  onProductChange,
  onInfluencerChange,
  onScriptChange,
  onWriteAll,
  onModelsChange,
  onDurationChange,
  onAspectRatioChange,
}: UgcConfigSidebarProps) {
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const scriptModels = useUgcProjectStore(s => s.scriptModels)
  const [productOpen, setProductOpen] = useState(false)
  const [localCreatorOpen, setLocalCreatorOpen] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const creatorDialogOpen = creatorOpen ?? localCreatorOpen
  const setCreatorDialogOpen = onCreatorOpenChange ?? setLocalCreatorOpen

  const productKind = parseUgcProductKind(project.productKind)
  const hasProduct = hasUgcProduct(project)
  const productThumb = project.productImageUrls[0]
  const creator = project.influencerId ? influencersById[project.influencerId] : undefined
  const creatorSrc = creator?.coverImageUrl || creator?.galleryImageUrls[0]
  const needsCreator = ugcNeedsCreator(project)
  const atLimit = project.clips.length >= UGC_MAX_CLIPS
  const resolved = ugcResolvedClipModels(project)
  const scriptModel = scriptModels.find(model => model.value === resolved.script) ?? scriptModels[0]
  const dialogueClips = project.clips.filter(clip => ugcClipShowsScript(clip.type))

  const move = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const ids = project.clips.map(clip => clip.id)
    const from = ids.indexOf(fromId)
    const to = ids.indexOf(toId)
    if (from < 0 || to < 0) return
    const next = [...ids]
    const [picked] = next.splice(from, 1)
    if (!picked) return
    next.splice(to, 0, picked)
    onReorder(next)
  }

  return (
    <aside className="flex max-h-[42vh] w-full shrink-0 flex-col overflow-y-auto border-b border-border/40 lg:max-h-none lg:w-80 lg:border-r lg:border-b-0">
      <SidebarSection
        label="Product"
        action={
          <button
            type="button"
            onClick={() => setProductOpen(true)}
            className="text-[12px] text-muted-foreground hover:text-foreground"
          >
            {hasProduct ? 'Edit' : 'Add'}
          </button>
        }
      >
        {hasProduct ? (
          <button
            type="button"
            onClick={() => setProductOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl text-left transition hover:bg-muted/40"
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50">
              {productThumb ? (
                <Image alt="" className="object-cover" fill sizes="40px" src={productThumb} unoptimized />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <PackageIcon className="size-4" strokeWidth={1.5} />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">
                {project.productName?.trim() || 'Untitled product'}
              </span>
              {productKind ? (
                <span className="text-[11px] text-muted-foreground">{UGC_PRODUCT_KIND_LABELS[productKind]}</span>
              ) : null}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setProductOpen(true)}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border/70 px-3 py-3 text-[12px] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
          >
            <PackageIcon className="size-3.5" strokeWidth={1.5} />
            Add product
          </button>
        )}
      </SidebarSection>

      <SidebarSection
        label="Scenes"
        action={
          <UgcAddSceneMenu
            clips={project.clips}
            creating={creatingScenes}
            onAdd={onAddClip}
            onUseStarter={onUseStarter}
          >
            <button
              type="button"
              disabled={atLimit || creatingScenes}
              className="text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              Add
            </button>
          </UgcAddSceneMenu>
        }
      >
        {project.clips.length === 0 ? (
          <button
            type="button"
            disabled={creatingScenes}
            onClick={onUseStarter}
            className="w-full rounded-xl bg-foreground px-3 py-2.5 text-left text-background transition active:scale-[0.99] disabled:opacity-60"
          >
            <p className="text-[13px] font-medium">Use a simple 3-scene ad</p>
            <p className="mt-0.5 text-[11px] text-background/70">Talk · Hold · Show</p>
          </button>
        ) : (
          <div className="space-y-1">
            {project.clips.map(clip => {
              const Icon = UGC_SCENE_ICONS[clip.type]
              const selected = clip.id === selectedClipId
              const generating = clip.status === 'generating'
              return (
                <div
                  key={clip.id}
                  draggable
                  onDragStart={() => setDraggingId(clip.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={event => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) move(draggingId, clip.id)
                    setDraggingId(null)
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition',
                    draggingId === clip.id && 'opacity-50',
                    selected ? 'bg-muted/60' : 'hover:bg-muted/40',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectClip(clip.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-3.5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">
                        {UGC_CLIP_TYPE_LABELS[clip.type]}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {ugcSceneBadge(clip, generating)}
                      </span>
                    </span>
                  </button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="size-6 shrink-0"
                    aria-label="Remove scene"
                    onClick={() => onDeleteClip(clip.id)}
                  >
                    <Trash2Icon className="size-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </SidebarSection>

      <SidebarSection
        label="Creator"
        action={
          needsCreator && !project.influencerId ? (
            <span className="text-[11px] text-muted-foreground">Required</span>
          ) : null
        }
      >
        <button
          type="button"
          onClick={() => setCreatorDialogOpen(true)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl text-left transition',
            creator
              ? 'hover:bg-muted/40'
              : 'border border-dashed border-border/70 px-3 py-3 hover:border-foreground/30',
          )}
        >
          {creator ? (
            <>
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/50">
                {creatorSrc ? (
                  <Image alt="" className="object-cover" fill sizes="40px" src={creatorSrc} unoptimized />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <UserRoundIcon className="size-4" strokeWidth={1.5} />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{creator.name}</span>
                <span className="text-[11px] text-muted-foreground">Change</span>
              </span>
            </>
          ) : (
            <>
              <UserRoundIcon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[12px] text-muted-foreground">Pick a creator</span>
            </>
          )}
        </button>
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
      </SidebarSection>

      <SidebarSection
        label="Script"
        action={
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[12px]"
            disabled={writingScript || !scriptModel || dialogueClips.length === 0}
            onClick={() => onWriteAll(scriptModel?.value)}
          >
            {writingScript ? <Loader2Icon className="size-3 animate-spin" /> : <SparklesIcon className="size-3" />}
            Write
          </Button>
        }
      >
        {project.clips.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">Add scenes to write lines.</p>
        ) : (
          <div className="space-y-3">
            {project.clips.map((clip, index) => (
              <ScriptRow
                key={clip.id}
                clip={clip}
                index={index}
                writing={writingScript}
                onChange={text => onScriptChange(clip.id, text)}
              />
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection label="Settings">
        <div className="space-y-4">
          <UgcModelChips
            imageValue={project.models.image}
            scriptValue={project.models.script}
            videoValue={project.models.video}
            scriptEnabled
            onChange={onModelsChange}
          />
          <UgcDurationControl value={project.clips[0]?.durationSec ?? 8} onChange={onDurationChange} />
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Aspect ratio">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio}
                type="button"
                role="radio"
                aria-checked={project.aspectRatio === ratio}
                onClick={() => onAspectRatioChange(ratio)}
                className={
                  project.aspectRatio === ratio
                    ? 'rounded-full bg-foreground px-3 py-1 text-[12px] font-medium text-background'
                    : 'rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground ring-1 ring-border/70'
                }
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </SidebarSection>

      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Product</DialogTitle>
            <DialogDescription>Paste a link, drop a photo, or just describe it.</DialogDescription>
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
    </aside>
  )
}

function ScriptRow({
  clip,
  index,
  writing,
  onChange,
}: {
  clip: UgcClip
  index: number
  writing?: boolean
  onChange: (text: string) => void
}) {
  const text = clip.script?.text ?? ''
  const shows = ugcClipShowsScript(clip.type)
  const target = ugcScriptTargetChars(clip.durationSec)

  if (!shows) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 px-3 py-2">
        <p className="text-[12px] font-medium tracking-tight">
          {index + 1}. {UGC_CLIP_TYPE_LABELS[clip.type]}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">No talking</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12px] font-medium tracking-tight">
          {index + 1}. {UGC_CLIP_TYPE_LABELS[clip.type]}
        </p>
        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
          {text.length}/{UGC_SCRIPT_MAX_CHARS} · ~{target}
        </span>
      </div>
      <Textarea
        value={text}
        onChange={event => onChange(event.target.value)}
        placeholder="One breath. Hook, proof, ask."
        className="min-h-16 text-[12px]"
        maxLength={UGC_SCRIPT_MAX_CHARS}
        disabled={writing}
      />
    </div>
  )
}
