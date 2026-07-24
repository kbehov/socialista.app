'use server'

import { generatePostCopy } from '@/agents/schemas/post-copywriter'
import type { PostCopywriterInput } from '@/agents/schemas/post-copywriter'
import { unstable_noStore as noStore } from 'next/cache'

export type GeneratePostCopyActionResult =
  | { success: true; caption: string }
  | { success: false; error: string }

export async function generatePostCopyAction(
  input: PostCopywriterInput,
): Promise<GeneratePostCopyActionResult> {
  noStore()
  try {
    const caption = await generatePostCopy(input)
    return { success: true, caption }
  } catch (error) {
    console.error('[generatePostCopyAction]', error)
    if (error instanceof Error && error.message.includes('Directions')) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to generate caption. Please try again.' }
  }
}
