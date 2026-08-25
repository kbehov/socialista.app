'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { createPublicAccessToken } from '@socialista/trigger'
import type { RealtimeVideoGenerationTask } from '@socialista/trigger/task-types'
import type { GenerateVideoOptions } from '@socialista/types'
import { clampVideoDuration, CostUnit, TASK_IDS } from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'

export type StartVideoGenerationResult =
  | { success: true; runId: string; publicAccessToken: string }
  | { success: false; error: string }

export async function startVideoGeneration(input: GenerateVideoOptions): Promise<StartVideoGenerationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'You must be signed in to generate videos.' }
  }

  try {
    const duration = clampVideoDuration(input.duration)
    const balanceRes = await getWorkspaceBalance(input.workspaceId)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const encoded = encodeURIComponent(input.model)
    const [textToVideo, imageToVideo] = await Promise.all([
      getModels(`limit=20&modelType=text-to-video&value=${encoded}`),
      getModels(`limit=20&modelType=image-to-video&value=${encoded}`),
    ])
    const model = textToVideo.data?.models[0] ?? imageToVideo.data?.models[0]

    if (!model) {
      return { success: false, error: 'Model not found.' }
    }

    const billedCost = model.costUnit === CostUnit.PER_SECOND ? model.cost * duration : model.cost
    if (credits < billedCost) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const handle = await tasks.trigger<RealtimeVideoGenerationTask>(TASK_IDS.videoGeneration, {
      prompt: input.prompt,
      model: input.model,
      workspaceId: input.workspaceId,
      userId: session.user.id,
      aspectRatio: input.aspectRatio,
      duration,
      generateAudio: input.generateAudio ?? true,
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      ...(input.imageUrls && input.imageUrls.length > 0 ? { imageUrls: input.imageUrls } : {}),
      ...(input.skillId ? { skillId: input.skillId } : {}),
      ...(input.projectId ? { projectId: input.projectId } : {}),
    })

    const publicAccessToken = await createPublicAccessToken(handle.id)

    return {
      success: true,
      runId: handle.id,
      publicAccessToken,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start video generation',
    }
  }
}
