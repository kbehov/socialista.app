import { POST_COPYWRITING_SYSTEM } from '@/agents/prompts/copywriting'
import { auth } from '@/auth'
import { createCompletionUIStreamResponse } from '@/utils/ai-stream.utils'
import {
  buildPostCopywriterMessages,
  buildPostCopywriterUserPrompt,
  sanitizePostCompletionBody,
  type PostCompletionBody,
} from '@/utils/post-copywriter.utils'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // auth() and getCurrentWorkspace() are independent I/O calls — run them
  // concurrently instead of serially to shave latency off every request.
  // Parse the body in parallel too; only bail out on a bad body after we
  // already need it, so this doesn't waste the auth/workspace round trip.
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

  try {
    const result = streamText({
      model: 'openai/gpt-5.6-luna',
      system: POST_COPYWRITING_SYSTEM,
      // Higher temp + light penalties: more voice/angle variety, less formulaic AI cadence.
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
