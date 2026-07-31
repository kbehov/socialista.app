'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { TASK_IDS } from '@socialista/types'
import type { RealtimeImageGenerationTask } from '@socialista/trigger/task-types'
import { imageGenerationPayloadSchema } from '@socialista/trigger/schemas/image-generation'
import { auth as triggerAuth, tasks } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

const startImageGenerationSchema = imageGenerationPayloadSchema.omit({ userId: true }).extend({
  prompt: z.string().trim().min(1, 'Prompt is required'),
  model: z.string().min(1, 'Model is required'),
  workspaceId: z.string().min(1, 'Workspace is required'),
})

export type StartImageGenerationInput = z.infer<typeof startImageGenerationSchema>

export type StartImageGenerationResult =
  | { success: true; runId: string; publicAccessToken: string }
  | { success: false; error: string }

export async function startImageGeneration(
  input: StartImageGenerationInput,
): Promise<StartImageGenerationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'You must be signed in to generate images.' }
  }

  const parsed = startImageGenerationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    const balanceRes = await getWorkspaceBalance(parsed.data.workspaceId)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const modelsRes = await getModels(
      `limit=100&modelType=text-to-image&value=${encodeURIComponent(parsed.data.model)}`,
    )
    const model = modelsRes.data?.models[0]
    if (!model) {
      return { success: false, error: 'Model not found.' }
    }
    if (credits < model.cost) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const handle = await tasks.trigger<RealtimeImageGenerationTask>(TASK_IDS.imageGeneration, {
      ...parsed.data,
      userId: session.user.id,
    })

    const publicAccessToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: handle.id,
        },
      },
      expirationTime: '1h',
    })

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
