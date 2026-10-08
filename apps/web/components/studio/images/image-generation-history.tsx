'use client'

import { StudioGenerationHistory } from '@/components/studio/studio-generation-history'

type ImageGenerationHistoryProps = {
  onTotalChange?: (total: number) => void
  scrollTargetId?: string
}

export function ImageGenerationHistory(props: ImageGenerationHistoryProps) {
  return <StudioGenerationHistory kind="image" {...props} />
}
