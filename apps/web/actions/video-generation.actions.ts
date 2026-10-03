'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { createPublicAccessToken } from '@socialista/trigger'
import type { RealtimeVideoGenerationTask } from '@socialista/trigger/task-types'
import type { GenerateVideoOptions } from '@socialista/types'
import {
  clampVideoDuration,
  estimateVideoCredits,
  isAutoVideoDuration,
  TASK_IDS,
  VIDEO_DURATION_AUTO,
  VIDEO_RESOLUTION_DEFAULT,
} from '@socialista/types'
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
    const isAuto = isAutoVideoDuration(input.duration)
    const duration = isAuto ? VIDEO_DURATION_AUTO : clampVideoDuration(input.duration)
    const resolution = input.resolution ?? VIDEO_RESOLUTION_DEFAULT
    const balanceRes = await getWorkspaceBalance(input.workspaceId)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const encoded = encodeURIComponent(input.model)
    const modelsRes = await getModels(`limit=20&modelType=video&value=${encoded}`)
    const model = modelsRes.data?.models[0]

    if (!model) {
      return { success: false, error: 'Model not found.' }
    }

    if (
      model.resolutions?.length &&
      !model.resolutions.some(entry => entry.value === resolution)
    ) {
      return { success: false, error: 'That resolution is not supported by this model.' }
    }

    const billedCost = estimateVideoCredits(model, resolution, duration)
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
      resolution,
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      ...(input.imageUrls && input.imageUrls.length > 0 ? { imageUrls: input.imageUrls } : {}),
      ...(input.skillId ? { skillId: input.skillId } : {}),
      ...(input.projectId ? { projectId: input.projectId } : {}),
      ...(input.enhance === false ? { enhance: false } : {}),
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
