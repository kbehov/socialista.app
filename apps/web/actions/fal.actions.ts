'use server'

import { fal } from '@/lib/fal-server'

export type GeneratedImage = {
  url: string
  width: number
  height: number
  content_type: string
  file_name?: string
}

export type EditImageResult = { success: true; data: GeneratedImage } | { success: false; error: string }

export type GeneratedVideo = {
  url: string
  content_type?: string
  file_name?: string
}

export type EditVideoResolution = 'auto' | '480p' | '720p'

export type EditVideoResult = { success: true; data: GeneratedVideo } | { success: false; error: string }

export type AnimateImageResult = { success: true; data: GeneratedVideo } | { success: false; error: string }

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

export async function editVideo(
  prompt: string,
  videoUrl: string,
  resolution: EditVideoResolution = 'auto',
): Promise<EditVideoResult> {
  const trimmedPrompt = prompt.trim()
  if (!trimmedPrompt) {
    return { success: false, error: 'Prompt is required' }
  }

  if (!videoUrl.trim()) {
    return { success: false, error: 'Video URL is required' }
  }

  if (!process.env.FAL_KEY) {
    return { success: false, error: 'Video editing is not configured' }
  }

  try {
    const response = await fal.subscribe('xai/grok-imagine-video/edit-video', {
      input: {
        prompt: trimmedPrompt,
        video_url: videoUrl,
        resolution,
      },
      logs: true,
      onQueueUpdate: update => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map(log => log.message).forEach(console.log)
        }
      },
    })

    const video = (response.data as { video?: GeneratedVideo }).video
    if (!video?.url) {
      return { success: false, error: 'No video was returned' }
    }

    return { success: true, data: video }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to edit video',
    }
  }
}

export async function animateImage(
  prompt: string,
  imageUrl: string,
  duration: number,
): Promise<AnimateImageResult> {
  const trimmedPrompt = prompt.trim()
  if (!trimmedPrompt) {
    return { success: false, error: 'Prompt is required' }
  }

  if (!imageUrl.trim()) {
    return { success: false, error: 'Image URL is required' }
  }

  if (!process.env.FAL_KEY) {
    return { success: false, error: 'Image animation is not configured' }
  }

  try {
    const response = await fal.subscribe('xai/grok-imagine-video/image-to-video', {
      input: {
        prompt: trimmedPrompt,
        image_url: imageUrl,
        aspect_ratio: 'auto',
        duration,
      },
      logs: true,
      onQueueUpdate: update => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map(log => log.message).forEach(console.log)
        }
      },
    })

    const video = (response.data as { video?: GeneratedVideo }).video
    if (!video?.url) {
      return { success: false, error: 'No video was returned' }
    }

    return { success: true, data: video }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to animate image',
    }
  }
}
