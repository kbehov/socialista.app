import { createNotification, type CreateNotificationInput } from '@socialista/db'
import { NotificationResourceKind, NotificationType } from '@socialista/types'
import { logger } from '@trigger.dev/sdk/v3'

export async function notifyUser(input: CreateNotificationInput): Promise<void> {
  try {
    await createNotification(input)
  } catch (error) {
    logger.warn('Failed to create notification', {
      type: input.type,
      workspace: input.workspace,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

type GenerationKind = 'image' | 'static-ad' | 'video' | 'slideshow'

const GENERATION_COMPLETED_TYPE: Record<GenerationKind, NotificationType> = {
  image: NotificationType.GENERATION_IMAGE_COMPLETED,
  'static-ad': NotificationType.GENERATION_STATIC_AD_COMPLETED,
  video: NotificationType.GENERATION_VIDEO_COMPLETED,
  slideshow: NotificationType.GENERATION_SLIDESHOW_COMPLETED,
}

const GENERATION_FAILED_TYPE: Record<GenerationKind, NotificationType> = {
  image: NotificationType.GENERATION_IMAGE_FAILED,
  'static-ad': NotificationType.GENERATION_STATIC_AD_FAILED,
  video: NotificationType.GENERATION_VIDEO_FAILED,
  slideshow: NotificationType.GENERATION_SLIDESHOW_FAILED,
}

const GENERATION_COMPLETED_COPY: Record<GenerationKind, { title: string; body: string }> = {
  image: { title: 'Image ready', body: 'Your image generation finished successfully.' },
  'static-ad': { title: 'Static ad ready', body: 'Your static ad generation finished successfully.' },
  video: { title: 'Video ready', body: 'Your video generation finished successfully.' },
  slideshow: { title: 'Slideshow ready', body: 'Your slideshow was generated successfully.' },
}

const GENERATION_FAILED_COPY: Record<GenerationKind, { title: string; body: string }> = {
  image: { title: 'Image generation failed', body: 'We could not finish generating your image.' },
  'static-ad': {
    title: 'Static ad generation failed',
    body: 'We could not finish generating your static ad.',
  },
  video: { title: 'Video generation failed', body: 'We could not finish generating your video.' },
  slideshow: {
    title: 'Slideshow generation failed',
    body: 'We could not finish generating your slideshow.',
  },
}

export async function notifyGenerationComplete(input: {
  workspaceId: string
  userId: string
  generationId: string
  triggerRunId: string
  kind: GenerationKind
  videoId?: string
}): Promise<void> {
  const copy = GENERATION_COMPLETED_COPY[input.kind]
  await notifyUser({
    workspace: input.workspaceId,
    userId: input.userId,
    type: GENERATION_COMPLETED_TYPE[input.kind],
    title: copy.title,
    body: copy.body,
    resource: { kind: NotificationResourceKind.GENERATION, id: input.generationId },
    metadata: {
      generationKind: input.kind,
      triggerRunId: input.triggerRunId,
      ...(input.videoId ? { videoId: input.videoId } : {}),
    },
    dedupeKey: `generation.completed:${input.generationId}`,
  })
}

export async function notifyGenerationFailed(input: {
  workspaceId: string
  userId: string
  generationId?: string
  triggerRunId: string
  kind: GenerationKind
}): Promise<void> {
  const copy = GENERATION_FAILED_COPY[input.kind]
  const resourceId = input.generationId ?? input.triggerRunId
  await notifyUser({
    workspace: input.workspaceId,
    userId: input.userId,
    type: GENERATION_FAILED_TYPE[input.kind],
    title: copy.title,
    body: copy.body,
    resource: { kind: NotificationResourceKind.GENERATION, id: resourceId },
    metadata: {
      generationKind: input.kind,
      triggerRunId: input.triggerRunId,
    },
    dedupeKey: `generation.failed:${resourceId}`,
  })
}

export async function notifyPostPublished(input: {
  workspaceId: string
  userId: string
  postId: string
  scheduleRevision: number
}): Promise<void> {
  await notifyUser({
    workspace: input.workspaceId,
    userId: input.userId,
    type: NotificationType.POST_PUBLISHED,
    title: 'Post published',
    body: 'Your scheduled post was published.',
    resource: { kind: NotificationResourceKind.POST, id: input.postId },
    metadata: { scheduleRevision: input.scheduleRevision },
    dedupeKey: `post.published:${input.postId}:${input.scheduleRevision}`,
  })
}

export async function notifyPostFailed(input: {
  workspaceId: string
  userId: string
  postId: string
  scheduleRevision: number
}): Promise<void> {
  await notifyUser({
    workspace: input.workspaceId,
    userId: input.userId,
    type: NotificationType.POST_FAILED,
    title: 'Post failed to publish',
    body: 'We could not publish your scheduled post.',
    resource: { kind: NotificationResourceKind.POST, id: input.postId },
    metadata: { scheduleRevision: input.scheduleRevision },
    dedupeKey: `post.failed:${input.postId}:${input.scheduleRevision}`,
  })
}
