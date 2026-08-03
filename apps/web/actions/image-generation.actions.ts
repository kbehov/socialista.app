'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { createPublicAccessToken } from '@socialista/trigger'
import type { RealtimeImageGenerationTask } from '@socialista/trigger/task-types'
import type { GenerateImageOptions } from '@socialista/types'
import { TASK_IDS } from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'

export type StartImageGenerationResult =
  | { success: true; runId: string; publicAccessToken: string }
  | { success: false; error: string }

export async function startImageGeneration(input: GenerateImageOptions): Promise<StartImageGenerationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'You must be signed in to generate images.' }
  }

  try {
    const balanceRes = await getWorkspaceBalance(input.workspaceId)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const modelsRes = await getModels(`limit=100&modelType=text-to-image&value=${encodeURIComponent(input.model)}`)
    const model = modelsRes.data?.models[0]

    if (!model) {
      return { success: false, error: 'Model not found.' }
    }

    if (credits < model.cost) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const handle = await tasks.trigger<RealtimeImageGenerationTask>(TASK_IDS.imageGeneration, {
      ...input,
      userId: session.user.id,
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
      error: error instanceof Error ? error.message : 'Failed to start image generation',
    }
  }
}
