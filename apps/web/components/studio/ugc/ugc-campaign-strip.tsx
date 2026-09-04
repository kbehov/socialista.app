'use client'

import { UgcInfluencerPicker } from '@/components/studio/ugc/ugc-influencer-picker'
import { UgcProductInput } from '@/components/studio/ugc/ugc-product-input'
import { cn } from '@/lib/utils'
import type { UgcProject } from '@socialista/types'

type UgcCampaignStripProps = {
  workspaceId: string
  project: UgcProject
  expanded?: boolean
  disabled?: boolean
  onProductChange: (next: { imageUrls: string[]; productName?: string; productId?: string | null }) => void
  onInfluencerChange: (ids: string[]) => void
}

export function UgcCampaignStrip({
  workspaceId,
  project,
  expanded,
  disabled,
  onProductChange,
  onInfluencerChange,
}: UgcCampaignStripProps) {
  return (
    <div className={cn('space-y-3', expanded && 'mx-auto w-full max-w-2xl')}>
      {expanded ? (
        <div className="px-1">
          <p className="text-lg font-semibold tracking-tight">Set up this campaign</p>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Lock the product and creator first. Every scene in this ad uses the same pair.
          </p>
        </div>
      ) : null}
      <div className={cn('grid gap-3', expanded ? 'sm:grid-cols-2' : 'lg:grid-cols-2')}>
        <UgcProductInput
          workspaceId={workspaceId}
          imageUrls={project.productImageUrls}
          productName={project.productName}
          productId={project.productId}
          disabled={disabled}
          onChange={onProductChange}
        />
        <UgcInfluencerPicker
          workspaceId={workspaceId}
          selectedIds={project.influencerId ? [project.influencerId] : []}
          disabled={disabled}
          max={1}
          onChange={onInfluencerChange}
        />
      </div>
    </div>
  )
}
