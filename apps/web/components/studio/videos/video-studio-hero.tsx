'use client'

import { StudioDitherHero } from '@/components/studio/studio-dither-hero'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export function VideoStudioHero() {
  return (
    <StudioDitherHero
      src="/socialista-video.webp"
      chipLabel="Video studio"
      title="Clips"
      titleAccent="in seconds."
      description="Prompt the motion. Generate a clip. Cut it in the editor."
      imagePosition="object-[50%_40%]"
      actions={
        <Button
          asChild
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-0 bg-black px-3.5 text-[12px] font-medium text-white shadow-none hover:bg-black hover:text-white active:scale-[0.98] motion-reduce:active:scale-100"
        >
          <Link href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}>
            <PlusIcon className="size-3.5" strokeWidth={1.75} />
            Create now
          </Link>
        </Button>
      }
    />
  )
}
