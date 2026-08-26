'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { getWorkspaceBalance } from '@/services/workspace.service'
import { resolveStaticAdImages, staticAdPayloadObjectSchema } from '@socialista/trigger/schemas/static-ad'
import type { RealtimeStaticAdGenerationTask } from '@socialista/trigger/task-types'
import { clampImageGenerationCount, ContextSupport, TASK_IDS } from '@socialista/types'
import { tasks, auth as triggerAuth } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

const startStaticAdGenerationSchema = staticAdPayloadObjectSchema.omit({ userId: true })

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
    const [balanceRes, modelsRes] = await Promise.all([
      getWorkspaceBalance(parsed.data.workspaceId),
      getModels(
        `limit=1&modelType=text-to-image&contextSupports=image&value=${encodeURIComponent(parsed.data.model)}`,
      ),
    ])
    const credits = balanceRes.data?.aiCreditsBalance ?? 0

    const model = modelsRes.data?.models[0]
    if (!model?.contextSupports?.includes(ContextSupport.IMAGE)) {
      return {
        success: false,
        error: 'Select a text-to-image model that supports image inputs.',
      }
    }
    const numImages = clampImageGenerationCount(parsed.data.numImages)
    if (credits < model.cost * numImages) {
      return { success: false, error: 'Insufficient AI credits.' }
    }

    const images = resolveStaticAdImages(parsed.data)
    if (images.length === 0) {
      return { success: false, error: 'Add at least one reference image.' }
    }
    const productImage = images.find(image => image.role === 'product') ?? images[0]
    const templateImage = images.find(image => image.role === 'template')

    const handle = await tasks.trigger<RealtimeStaticAdGenerationTask>(TASK_IDS.staticAdGeneration, {
      prompt: parsed.data.prompt,
      workspaceId: parsed.data.workspaceId,
      userId: session.user.id,
      aspectRatio: parsed.data.aspectRatio,
      images,
      ...(productImage ? { productImage: productImage.url } : {}),
      ...(templateImage ? { referenceImage: templateImage.url } : {}),
      adCopy: parsed.data.adCopy,
      language: parsed.data.language,
      numImages,
      model: model.value,
      ...(parsed.data.skillId ? { skillId: parsed.data.skillId } : {}),
      ...(parsed.data.projectId ? { projectId: parsed.data.projectId } : {}),
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
