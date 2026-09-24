import { StudioTemplateKind, type StudioTemplateDto } from '@socialista/types'

export type StudioTemplateRecreateIdea = {
  id: string
  label: string
  prompt: string
}

export function storedTemplatePrompt(template: StudioTemplateDto): string | undefined {
  if (template.kind !== StudioTemplateKind.IMAGE && template.kind !== StudioTemplateKind.VIDEO) {
    return undefined
  }
  const stored = template.payload.prompt?.trim()
  return stored || undefined
}

function randomIdeaPrompt(ideas: readonly StudioTemplateRecreateIdea[]): string {
  const index = Math.floor(Math.random() * ideas.length)
  return ideas[index]?.prompt ?? ideas[0]!.prompt
}

export function resolveTemplateRecreatePrompt(
  template: StudioTemplateDto,
  ideas: readonly StudioTemplateRecreateIdea[],
): string {
  return storedTemplatePrompt(template) ?? randomIdeaPrompt(ideas)
}
