'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { STATIC_AD_MODEL, TASK_IDS } from '@socialista/types'
import type { RealtimeStaticAdGenerationTask } from '@socialista/trigger/task-types'
import { staticAdPayloadObjectSchema } from '@socialista/trigger/schemas/static-ad'
import { auth as triggerAuth, tasks } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

const startStaticAdGenerationSchema = staticAdPayloadObjectSchema.omit({ userId: true, model: true })

export type StartStaticAdGenerationInput = z.infer<typeof startStaticAdGenerationSchema>

export type StartStaticAdGenerationResult =
  | { success: true; runId: string; publicAccessToken: string }
  | { success: false; error: string }

export async function startStaticAdGeneration(
  input: StartStaticAdGenerationInput,
): Promise<StartStaticAdGenerationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'You must be signed in to generate static ads.' }
  }

  const parsed = startStaticAdGenerationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    const balanceRes = await getWorkspaceBalance(parsed.data.workspaceId)
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const modelsRes = await getModels(
      `limit=1&modelType=text-to-image&value=${encodeURIComponent(STATIC_AD_MODEL)}`,
    )
    const model = modelsRes.data?.models[0]
    if (!model) {
      return {
        success: false,
        error: 'GPT Image 2 is not configured. Add openai/gpt-image-2 in the manager.',
      }
    }
    if (credits < model.cost) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const handle = await tasks.trigger<RealtimeStaticAdGenerationTask>(TASK_IDS.staticAdGeneration, {
      prompt: parsed.data.prompt,
      workspaceId: parsed.data.workspaceId,
      userId: session.user.id,
      aspectRatio: parsed.data.aspectRatio,
      productImage: parsed.data.productImage,
      adCopy: parsed.data.adCopy,
      language: parsed.data.language,
      model: STATIC_AD_MODEL,
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
      error: error instanceof Error ? error.message : 'Failed to start static ad generation',
    }
  }
}
