'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { InfluencerHookVideo } from '@socialista/types'
import Link from 'next/link'

type InfluencerHookVideoPreviewDialogProps = {
  clip: InfluencerHookVideo | null
  onOpenChange: (open: boolean) => void
}

export function InfluencerHookVideoPreviewDialog({ clip, onOpenChange }: InfluencerHookVideoPreviewDialogProps) {
  return (
    <Dialog open={clip !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex w-[min(96vw,22rem)] max-w-none flex-col gap-0 overflow-hidden border-black/10 bg-background p-0 sm:rounded-xl dark:border-white/12"
      >
        <DialogTitle className="sr-only">Hook video</DialogTitle>
        <DialogDescription className="sr-only">Full-size hook video preview</DialogDescription>
        {clip ? (
          <>
            <div className="flex items-center justify-center bg-black/[0.04] p-3 dark:bg-white/[0.03]">
              <video
                key={clip._id}
                src={clip.videoUrl}
                controls
                autoPlay
                playsInline
                className="aspect-9/16 max-h-[min(75vh,640px)] w-full rounded-lg object-contain ring-1 ring-black/8 dark:ring-white/10"
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" size="sm" asChild>
                <Link href={DASHBOARD_ROUTES.STUDIO.video(clip.videoId)}>Open in editor</Link>
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
