'use client'

import { ImageSourcePicker } from '@/components/carousel/image-source-picker'
import {
  StudioEmptyState,
  StudioPanelHeader,
  StudioPanelScrollArea,
  StudioPanelSection,
} from '@/components/carousel/studio-segmented-tabs'
import { useEditorStore } from '@/lib/carousel/store'
import { ImageIcon } from 'lucide-react'

export function StudioMediaPanel({
  embedded = false,
  showPanelHeader,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const panelHeaderVisible = showPanelHeader ?? embedded
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const addImageLayer = useEditorStore(s => s.addImageLayer)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {panelHeaderVisible ? (
        <div className="shrink-0 border-b border-border/50 px-3.5 py-3">
          <StudioPanelHeader title="Media" description="Upload, files, Unsplash, or paste a URL" />
        </div>
      ) : null}
      <StudioPanelScrollArea>
        {!activeSlideId ? (
          <StudioEmptyState
            title="No slide selected"
            description="Select a slide on the canvas to add media."
          />
        ) : (
          <>
            <StudioPanelSection
              title="Add image"
              description="Images become layers on the active slide. Drag to position on the canvas."
            >
              <ImageSourcePicker
                layout="studio"
                hint="You can also drop image files directly onto the canvas."
                onImageSelected={url => addImageLayer(activeSlideId, url)}
              />
            </StudioPanelSection>

            <div className="rounded-xl border border-border/40 bg-muted/10 px-3 py-2.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-xs ring-1 ring-border/40">
                  <ImageIcon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                </span>
                <p className="text-[11px] leading-[1.45] text-muted-foreground">
                  Tip: select an image layer to crop, filter, and transform it in the inspector.
                </p>
              </div>
            </div>
          </>
        )}
      </StudioPanelScrollArea>
    </div>
  )
}
