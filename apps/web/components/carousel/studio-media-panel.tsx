'use client'

import { ImageSourcePicker } from '@/components/carousel/image-source-picker'
import {
  StudioEmptyState,
  StudioPanelHeader,
  StudioPanelScrollArea,
  StudioPanelSection,
} from '@/components/carousel/studio-segmented-tabs'
import { useEditorStore } from '@/lib/carousel/store'

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
        <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
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
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Select an image layer to crop, filter, and transform it in the inspector.
            </p>
          </>
        )}
      </StudioPanelScrollArea>
    </div>
  )
}
