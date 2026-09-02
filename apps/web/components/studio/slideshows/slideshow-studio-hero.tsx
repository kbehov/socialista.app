'use client'

import { StudioDitherHero } from '@/components/studio/studio-dither-hero'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export function SlideshowStudioHero() {
  return (
    <StudioDitherHero
      src="/socialista-static-ads.webp"
      chipLabel="Slideshow studio"
      title="Carousels"
      titleAccent="in seconds."
      description="Prompt the hook. Generate the slides. Edit them on the canvas."
      imagePosition="object-[50%_28%]"
      actions={
        <Button
          asChild
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-0 bg-black px-3.5 text-[12px] font-medium text-white shadow-none hover:bg-black hover:text-white active:scale-[0.98] motion-reduce:active:scale-100"
        >
          <Link href={DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE}>
            <PlusIcon className="size-3.5" strokeWidth={1.75} />
            Create now
          </Link>
        </Button>
      }
    />
  )
}
