'use client'

import { Button } from '@/components/ui/button'
import { setStudioImageDrag } from '@/lib/studio/prompt/studio-image-drag'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import type { UgcClip, UgcProject } from '@socialista/types'
import { AudioLinesIcon, Loader2Icon, UploadIcon, VideoIcon } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type AssetKind = 'image' | 'audio' | 'video'

type ProjectAsset = {
  id: string
  kind: AssetKind
  url: string
  label: string
  clipId?: string
}

type UgcAssetsPanelProps = {
  workspaceId: string
  project: UgcProject
  clip?: UgcClip
  busy?: boolean
  onApplyImage: (url: string) => void
  onApplyAudio: (url: string) => void
}

const FILTERS = ['all', 'image', 'audio', 'video'] as const

export function UgcAssetsPanel({
  workspaceId,
  project,
  clip,
  busy,
  onApplyImage,
  onApplyAudio,
}: UgcAssetsPanelProps) {
  const [filter, setFilter] = useState<AssetKind | 'all'>('all')
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, startUpload] = useTransition()

  const assets = useMemo(() => collectAssets(project), [project])
  const visible = filter === 'all' ? assets : assets.filter(asset => asset.kind === filter)

  const upload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Upload an image')
      return
    }
    startUpload(async () => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadToWorkspace(workspaceId, formData)
      if (!response.success || !response.data?.url) {
        toast.error(response.message ?? 'Upload failed')
        return
      }
      onApplyImage(response.data.url)
    })
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={event => {
          const file = event.target.files?.[0]
          if (file) upload(file)
          event.target.value = ''
        }}
      />
      <div className="flex items-center gap-1">
        <div className="flex min-w-0 flex-1 gap-0.5 rounded-md bg-muted/70 p-0.5">
          {FILTERS.map(kind => (
            <button
              key={kind}
              type="button"
              onClick={() => setFilter(kind)}
              className={cn(
                'h-6 flex-1 rounded-[5px] text-[11px] font-medium capitalize transition-colors',
                filter === kind
                  ? 'bg-background text-foreground shadow-sm dark:bg-background/80'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {kind}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="shrink-0 text-muted-foreground"
          disabled={uploading || busy || !clip}
          aria-label="Upload image"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2Icon className="size-3.5 animate-spin" /> : <UploadIcon className="size-3.5" />}
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="px-1 py-10 text-center">
          <p className="text-[13px] font-medium tracking-tight">Nothing to reuse yet</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Generated photos, audio, and clips appear here.
          </p>
        </div>
      ) : (
        <>
          <p className="px-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Drag a photo onto the image or video prompt to attach it.
          </p>
          <div className="grid grid-cols-3 gap-1.5">
          {visible.map(asset => (
            <button
              key={asset.id}
              type="button"
              draggable={asset.kind === 'image'}
              disabled={busy || !clip || asset.kind === 'video'}
              title={asset.kind === 'image' ? 'Drag onto the prompt to attach, or click to use' : asset.label}
              onDragStart={event => {
                if (asset.kind !== 'image') {
                  event.preventDefault()
                  return
                }
                setStudioImageDrag(event.dataTransfer, {
                  url: asset.url,
                  label: asset.label,
                  source: asset.id.startsWith('product-') ? 'product' : 'library',
                })
              }}
              onClick={() => {
                if (asset.kind === 'audio') onApplyAudio(asset.url)
                else if (asset.kind === 'image') onApplyImage(asset.url)
              }}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-md bg-muted ring-1 ring-black/[0.06] transition hover:ring-black/20 disabled:opacity-50 dark:ring-white/[0.08] dark:hover:ring-white/20',
                asset.kind === 'image' && 'cursor-grab active:cursor-grabbing',
              )}
            >
              {asset.kind === 'image' ? (
                <Image alt="" src={asset.url} fill className="object-cover" sizes="80px" unoptimized draggable={false} />
              ) : (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  {asset.kind === 'audio' ? <AudioLinesIcon className="size-4" /> : <VideoIcon className="size-4" />}
                  <span className="px-1 text-center text-[10px] leading-tight">{asset.label}</span>
                </span>
              )}
              {asset.kind === 'image' ? (
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Drag or use
                </span>
              ) : null}
            </button>
          ))}
        </div>
        </>
      )}
    </div>
  )
}

function collectAssets(project: UgcProject): ProjectAsset[] {
  const assets: ProjectAsset[] = []
  project.productImageUrls.forEach((url, index) => {
    assets.push({ id: `product-${index}`, kind: 'image', url, label: project.productName || 'Product' })
  })
  for (const clip of project.clips) {
    clip.stills.forEach((still, index) => {
      if (!still.imageUrl) return
      assets.push({
        id: `${clip.id}-still-${index}`,
        kind: 'image',
        url: still.imageUrl,
        label: clip.name ?? 'Scene still',
        clipId: clip.id,
      })
    })
    if (clip.audioTakes && clip.audioTakes.length > 0) {
      clip.audioTakes.forEach((take, index) => {
        assets.push({
          id: `${clip.id}-audio-${take.id}`,
          kind: 'audio',
          url: take.audioUrl,
          label: clip.audioTakes && clip.audioTakes.length > 1 ? `Voiceover ${index + 1}` : 'Voiceover',
          clipId: clip.id,
        })
      })
    } else if (clip.audioUrl) {
      assets.push({
        id: `${clip.id}-audio`,
        kind: 'audio',
        url: clip.audioUrl,
        label: 'Voiceover',
        clipId: clip.id,
      })
    }
    if (clip.videoUrl) {
      assets.push({
        id: `${clip.id}-video`,
        kind: 'video',
        url: clip.videoUrl,
        label: 'Clip',
        clipId: clip.id,
      })
    }
  }
  const seen = new Set<string>()
  return assets.filter(asset => {
    if (seen.has(asset.url)) return false
    seen.add(asset.url)
    return true
  })
}
