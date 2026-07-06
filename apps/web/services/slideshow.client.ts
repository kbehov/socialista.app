'use client'

import { parseJson } from '@/lib/api-public'
import type { ApiResponse, SlideshowResponse } from '@socialista/types'

type FetchSlideshowOptions = {
  signal?: AbortSignal
}

export async function fetchSlideshow(
  id: string,
  { signal }: FetchSlideshowOptions = {},
): Promise<ApiResponse<{ slideshow: SlideshowResponse }>> {
  const response = await fetch(`/api/slideshows/${id}`, { signal })
  return parseJson(response)
}
