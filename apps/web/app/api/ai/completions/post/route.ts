import { resolvePrompt } from '@socialista/ai'
import { auth } from '@/auth'
import { loadSkillOverride } from '@/services/skill.service'
import { createCompletionUIStreamResponse } from '@/utils/ai-stream.utils'
import {
  buildPostCopywriterMessages,
  buildPostCopywriterUserPrompt,
  sanitizePostCompletionBody,
  type PostCompletionBody,
} from '@/utils/post-copywriter.utils'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { PROMPT_KEYS } from '@socialista/types'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

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

  const userPrompt = buildPostCopywriterUserPrompt(sanitized)
  const systemOverride = await loadSkillOverride(workspace._id, PROMPT_KEYS.postCopy, sanitized.skillId)
  const { model, system } = resolvePrompt(PROMPT_KEYS.postCopy, systemOverride)

  try {
    const result = streamText({
      model,
      system,
      temperature: 0.92,
      frequencyPenalty: 0.4,
      presencePenalty: 0.2,
      messages: buildPostCopywriterMessages(userPrompt, sanitized.media),
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
