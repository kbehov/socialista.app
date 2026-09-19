'use client'

import { UgcInfluencerPicker } from '@/components/studio/ugc/ugc-influencer-picker'
import { UgcProductInput, type UgcProductChange } from '@/components/studio/ugc/ugc-product-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { UgcPlanDraft } from '@/types/ugc.types'
import { productFromProject } from '@/utils/ugc/plan.utils'
import type { UgcProject } from '@socialista/types'
import { SparklesIcon } from 'lucide-react'
import { useState } from 'react'

export type { UgcPlanDraft }

type UgcPlanDialogProps = {
  open: boolean
  project: UgcProject
  workspaceId: string
  createHref: string
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: UgcPlanDraft) => void
}

function UgcPlanDialogForm({
  project,
  workspaceId,
  createHref,
  pending,
  onCancel,
  onSubmit,
}: {
  project: UgcProject
  workspaceId: string
  createHref: string
  pending?: boolean
  onCancel: () => void
  onSubmit: (draft: UgcPlanDraft) => void
}) {
  const [influencerId, setInfluencerId] = useState(project.influencerId ?? '')
  const [product, setProduct] = useState<UgcProductChange>(() => productFromProject(project))
  const [description, setDescription] = useState('')
  const canSubmit = Boolean(influencerId.trim()) && Boolean(description.trim()) && !pending

  return (
    <>
      <DialogHeader>
        <DialogTitle>Plan a UGC video</DialogTitle>
        <DialogDescription>
          Pick a creator, optionally a product, and describe the ad. We&apos;ll draft the scenes,
          scripts, and prompts.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label>Creator</Label>
          <UgcInfluencerPicker
            workspaceId={workspaceId}
            selectedIds={influencerId ? [influencerId] : []}
            createHref={createHref}
            embedded
            max={1}
            onChange={ids => setInfluencerId(ids[0] ?? '')}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label>Product</Label>
            <span className="text-[12px] text-muted-foreground">Optional</span>
          </div>
          <UgcProductInput
            workspaceId={workspaceId}
            imageUrls={product.imageUrls}
            productName={product.productName}
            productId={product.productId ?? undefined}
            productDescription={product.productDescription}
            productUrl={product.productUrl ?? undefined}
            productKind={product.productKind ?? undefined}
            embedded
            onChange={setProduct}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ugc-plan-brief">What should this video do?</Label>
          <Textarea
            id="ugc-plan-brief"
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="A 15s problem-solution for our vitamin C serum. Hook on dull winter skin, then a bathroom pump demo, then a simple CTA."
            className="min-h-28 text-[13px]"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              influencerId: influencerId.trim(),
              description: description.trim(),
              product,
            })
          }
        >
          <SparklesIcon className="size-3.5" />
          Generate plan
        </Button>
      </DialogFooter>
    </>
  )
}

export function UgcPlanDialog({
  open,
  project,
  workspaceId,
  createHref,
  pending,
  onOpenChange,
  onSubmit,
}: UgcPlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {open ? (
          <UgcPlanDialogForm
            project={project}
            workspaceId={workspaceId}
            createHref={createHref}
            pending={pending}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
