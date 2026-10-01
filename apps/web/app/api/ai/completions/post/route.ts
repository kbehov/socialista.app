import { resolvePrompt } from '@socialista/ai'
import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { loadSkillOverride } from '@/services/skill.service'
import { createCompletionUIStreamResponse } from '@/utils/ai-stream.utils'
import {
  buildPostCopywriterMessages,
  buildPostCopywriterUserPrompt,
  sanitizePostCompletionBody,
  type PostCompletionBody,
} from '@/utils/post-copywriter.utils'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { ModelType, PROMPT_KEYS, type Model } from '@socialista/types'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_CREDIT_COST = 1

async function resolveTextModel(
  value?: string,
): Promise<{ ok: true; model?: Model; cost: number } | { ok: false; error: string }> {
  const trimmed = value?.trim()
  if (!trimmed) return { ok: true, cost: FALLBACK_CREDIT_COST }

  const modelsRes = await getModels(
    `limit=1&modelType=${ModelType.TEXT}&value=${encodeURIComponent(trimmed)}`,
  )
  const model = modelsRes.data?.models[0]
  if (!model || model.modelType !== ModelType.TEXT) {
    return { ok: false, error: 'Select a text model to write the caption.' }
  }
  return { ok: true, model, cost: model.cost }
}

export async function POST(request: NextRequest) {
  const [session, workspace, parsedBody] = await Promise.all([
    auth(),
    getCurrentWorkspace(),
    request.json().catch(() => null),
  ])

  if (!session || !workspace) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = parsedBody as PostCompletionBody | null
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
  }

  const sanitized = sanitizePostCompletionBody(body)
  if ('error' in sanitized) {
    return NextResponse.json({ success: false, message: sanitized.error }, { status: 400 })
  }

  const textModelRes = await resolveTextModel(sanitized.model)
  if (!textModelRes.ok) {
    return NextResponse.json({ success: false, message: textModelRes.error }, { status: 400 })
  }

  const userPrompt = buildPostCopywriterUserPrompt(sanitized)
  const systemOverride = await loadSkillOverride(workspace._id, PROMPT_KEYS.postCopy, sanitized.skillId)
  const { model: defaultModel, system } = resolvePrompt(PROMPT_KEYS.postCopy, systemOverride)
  const model = textModelRes.model?.value ?? defaultModel
  const creditCost = textModelRes.cost

  try {
    const result = streamText({
      model,
      system,
      temperature: 0.92,
      frequencyPenalty: 0.4,
      presencePenalty: 0.2,
      messages: buildPostCopywriterMessages(userPrompt, sanitized.media),
      onFinish: async () => {
        try {
          await deductWorkspaceAiCredits(workspace._id, creditCost)
        } catch (error) {
          console.error('[ai/completions/post] credit deduction failed', error)
        }
      },
      onError: ({ error }) => {
        console.error('[ai/completions/post] stream error', error)
      },
    })

    return createCompletionUIStreamResponse(result)
  } catch (error) {
    console.error('[ai/completions/post] failed to start generation', error)
    return NextResponse.json({ success: false, message: 'Failed to generate caption' }, { status: 500 })
  }
}
