const SAFETY_REJECTION_PATTERN =
  /safety system|safety_violations|content.?policy|moderation/i

export function formatGenerationError(message: string): string {
  const normalized = message.replace(/^GatewayInternalServerError:\s*/i, '').trim()

  if (SAFETY_REJECTION_PATTERN.test(normalized)) {
    const violationMatch = normalized.match(/safety_violations=\[([^\]]+)\]/i)
    if (violationMatch?.[1]) {
      return `Your prompt was rejected by the content safety system (${violationMatch[1]}). Please revise your prompt and try again.`
    }
    return 'Your prompt was rejected by the content safety system. Please revise your prompt and try again.'
  }

  return normalized || 'The generation run did not complete.'
}

export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return formatGenerationError(error)
  }

  if (error instanceof Error) {
    return formatGenerationError(error.message)
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message
    if (typeof message === 'string') {
      return formatGenerationError(message)
    }
  }

  return 'The generation run did not complete.'
}
