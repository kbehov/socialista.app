import { POST_COPYWRITING_SYSTEM } from '@/agents/prompts/copywriting'
import { auth } from '@/auth'
import type { SocialProvider } from '@socialista/types'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

type PostCompletionBody = {
  prompt: string
  platforms?: SocialProvider[]
  existingCaption?: string
  captionMax?: number
}

function buildUserPrompt({ prompt, platforms, existingCaption, captionMax }: PostCompletionBody): string {
  const lines: string[] = []

  if (platforms?.length) {
    lines.push(`Target platforms: ${platforms.join(', ')}`)
  }

  if (captionMax) {
    lines.push(`Hard character limit: ${captionMax} characters. Never exceed this.`)
  }

  if (existingCaption?.trim()) {
    lines.push(`Existing caption in the composer (improve, rewrite, or build on this if relevant):\n${existingCaption.trim()}`)
  }

  lines.push(`\nUser brief:\n${prompt.trim()}`)

  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as PostCompletionBody
  const prompt = body.prompt?.trim()

  if (!prompt) {
    return NextResponse.json({ success: false, message: 'Prompt is required' }, { status: 400 })
  }

  const result = streamText({
    model: 'openai/gpt-5.6-luna',
    system: POST_COPYWRITING_SYSTEM,
    prompt: buildUserPrompt({ ...body, prompt }),
  })

  return result.toTextStreamResponse()
}
