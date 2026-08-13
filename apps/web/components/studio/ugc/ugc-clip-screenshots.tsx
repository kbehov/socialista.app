'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { ImageIcon, Loader2Icon, UploadIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useRef, useTransition } from 'react'
import { toast } from 'sonner'

type UgcClipScreenshotsProps = {
  workspaceId: string
  imageUrls: string[]
  disabled?: boolean
  onChange: (urls: string[]) => void
}

export function UgcClipScreenshots({ workspaceId, imageUrls, disabled, onChange }: UgcClipScreenshotsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, startUpload] = useTransition()

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'flex items-center justify-between px-4 py-3')}>
        <div>
          <h2 className={dashboardSurface.sectionTitle}>App screens</h2>
          <p className={dashboardSurface.sectionDescription}>Screenshots of the UI to show on the phone.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2Icon className="size-3.5 animate-spin" /> : <UploadIcon className="size-3.5" />}
          Upload
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto p-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            startUpload(async () => {
              const formData = new FormData()
              formData.append('file', file)
              const response = await uploadToWorkspace(workspaceId, formData)
              if (!response.success || !response.data?.url) {
                toast.error(response.message ?? 'Upload failed')
                return
              }
              onChange([...imageUrls, response.data.url])
            })
          }}
        />
        {imageUrls.length === 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className={cn(dashboardSurface.insetDashed, 'flex h-28 w-20 shrink-0 flex-col items-center justify-center gap-1')}
          >
            <ImageIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[11px] text-muted-foreground">Add</span>
          </button>
        ) : (
          imageUrls.map(url => (
            <div key={url} className="relative w-20 shrink-0">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
                <Image alt="" className="object-cover" fill sizes="80px" src={url} unoptimized />
              </div>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                disabled={disabled}
                className="absolute -top-1 -right-1 size-6 rounded-full bg-background shadow-xs ring-1 ring-border/60"
                aria-label="Remove screenshot"
                onClick={() => onChange(imageUrls.filter(item => item !== url))}
              >
                <XIcon className="size-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
