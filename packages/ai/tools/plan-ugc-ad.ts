import {
  clampUgcDuration,
  clampUgcScript,
  PROMPT_KEYS,
  ugcClipRequiresScript,
  type UgcAdPlan,
  type UgcAdPlanScene,
} from '@socialista/types'
import { generateObject, type ModelMessage } from 'ai'

import { buildUgcAdPlanMessages, type PlanUgcAdInput } from '../builders/ugc-ad-plan.js'
import { resolvePrompt } from '../registry.js'
import { ugcAdPlanSchema } from '../schemas/ugc-ad-plan.js'

function normalizeScene(scene: UgcAdPlanScene): UgcAdPlanScene {
  const type = scene.type
  const script = ugcClipRequiresScript(type) ? clampUgcScript(scene.script.trim()) : ''

  return {
    name: scene.name.trim(),
    type,
    goal: scene.goal.trim(),
    script,
    imagePrompt: scene.imagePrompt.trim(),
    videoPrompt: scene.videoPrompt.trim(),
    durationSec: clampUgcDuration(scene.durationSec),
  }
}

function sceneIssues(scenes: UgcAdPlanScene[]): string[] {
  const issues: string[] = []
  scenes.forEach((scene, index) => {
    const n = index + 1
    if (!scene.imagePrompt || !scene.videoPrompt) {
      issues.push(`Scene ${n} (${scene.type}) is missing its image or video prompt.`)
    }
    if (ugcClipRequiresScript(scene.type) && !scene.script.trim()) {
      issues.push(`Scene ${n} (${scene.type}) is missing its spoken script.`)
    }
  })
  return issues
}

export async function planUgcAd(input: PlanUgcAdInput): Promise<UgcAdPlan> {
  const description = input.description.trim()
  if (!description) {
    throw new Error('Describe the video you want to build')
  }

  const influencerImageUrl = input.influencerImageUrl.trim()
  if (!influencerImageUrl) {
    throw new Error('Creator photo is required')
  }

  const { model, system } = resolvePrompt(PROMPT_KEYS.ugcAdPlan, input.systemOverride)
  const baseMessages = buildUgcAdPlanMessages({ ...input, description, influencerImageUrl })

  const generate = (messages: ModelMessage[]) =>
    generateObject({
      model,
      schema: ugcAdPlanSchema,
      system,
      temperature: 0.7,
      messages,
    })

  let result = await generate(baseMessages)
  let scenes = result.object.scenes.map(normalizeScene)
  const issues = sceneIssues(scenes)

  if (issues.length > 0) {
    result = await generate([
      ...baseMessages,
      {
        role: 'user',
        content: `${issues.join(' ')} Fix and return the full plan again.`,
      },
    ])
    scenes = result.object.scenes.map(normalizeScene)
  }

  const usable = scenes.filter(scene => scene.imagePrompt && scene.videoPrompt)
  if (usable.length === 0) {
    throw new Error('Planner returned no usable scenes')
  }
  if (usable.some(scene => ugcClipRequiresScript(scene.type) && !scene.script.trim())) {
    throw new Error('Planner returned scenes without scripts')
  }

  return {
    concept: result.object.concept.trim(),
    format: result.object.format.trim(),
    targetAudience: result.object.targetAudience.trim(),
    scenes: usable,
  }
}
