'use server'

import { fal } from '@/lib/fal-server'

export type GeneratedImage = {
  url: string
  width: number
  height: number
  content_type: string
  file_name?: string
}

export type EditImageResult =
  | { success: true; data: GeneratedImage }
  | { success: false; error: string }

const model = 'xai/grok-imagine-image/edit'

export async function editImage(prompt: string, imageUrl: string): Promise<EditImageResult> {
  const trimmedPrompt = prompt.trim()
  if (!trimmedPrompt) {
    return { success: false, error: 'Prompt is required' }
  }

  if (!imageUrl.trim()) {
    return { success: false, error: 'Image URL is required' }
  }

  if (!process.env.FAL_KEY) {
    return { success: false, error: 'Image editing is not configured' }
  }

  try {
    const response = await fal.subscribe(model, {
      input: {
        prompt: trimmedPrompt,
        image_urls: [imageUrl],
      },
    })

    const image = (response.data as { images?: GeneratedImage[] }).images?.[0]
    if (!image?.url) {
      return { success: false, error: 'No image was returned' }
    }

    return { success: true, data: image }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to edit image',
    }
  }
}
