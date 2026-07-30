import {
  createUIMessageStreamResponse,
  toUIMessageStream,
  type TextStreamPart,
  type ToolSet,
} from 'ai'

/**
 * Wrap a `streamText` result as a UI message stream Response for `useCompletion` /
 * `useChat` (default `data` / UI message stream protocol).
 */
export function createCompletionUIStreamResponse<TOOLS extends ToolSet>(result: {
  stream: ReadableStream<TextStreamPart<TOOLS>>
}) {
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
