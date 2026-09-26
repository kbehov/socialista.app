import {
  clampUgcDuration,
  clampUgcScript,
  coerceUgcClipType,
  PROMPT_KEYS,
  ugcCatalogSceneName,
  ugcClipRequiresProduct,
  ugcClipRequiresScript,
  ugcPlannableClipTypes,
  type UgcAdPlan,
  type UgcAdPlanScene,
  type UgcClipType,
} from '@socialista/types'
import { generateObject, type ModelMessage } from 'ai'

import {
  buildUgcAdPlanMessages,
  ugcAdPlanHasProduct,
  type PlanUgcAdInput,
} from '../builders/ugc-ad-plan.js'
import { resolvePrompt } from '../registry.js'
import { ugcAdPlanSchema } from '../schemas/ugc-ad-plan.js'

type GeneratedScene = {
  type: string
  goal: string
  script: string
  imagePrompt: string
  videoPrompt: string
  durationSec: number
}

function normalizeScene(scene: GeneratedScene, allowed: ReadonlySet<UgcClipType>): UgcAdPlanScene | null {
  const type = coerceUgcClipType(scene.type)
  if (!type || !allowed.has(type)) return null

  const script = ugcClipRequiresScript(type) ? clampUgcScript(scene.script.trim(), type) : ''

  return {
    name: ugcCatalogSceneName(type),
    type,
    goal: scene.goal.trim(),
    script,
    imagePrompt: scene.imagePrompt.trim(),
    videoPrompt: scene.videoPrompt.trim(),
    durationSec: clampUgcDuration(scene.durationSec),
  }
}

function applyCatalogNames(scenes: UgcAdPlanScene[]): UgcAdPlanScene[] {
  const seen = new Map<UgcClipType, number>()
  return scenes.map(scene => {
    const n = (seen.get(scene.type) ?? 0) + 1
    seen.set(scene.type, n)
    return { ...scene, name: ugcCatalogSceneName(scene.type, n) }
  })
}

function sceneIssues(
  scenes: UgcAdPlanScene[],
  allowedTypes: readonly UgcClipType[],
  hasProduct: boolean,
): string[] {
  const issues: string[] = []
  const allowed = new Set(allowedTypes)

  scenes.forEach((scene, index) => {
    const n = index + 1
    if (!allowed.has(scene.type)) {
      issues.push(
        `Scene ${n} uses type "${scene.type}", which is not available for this plan. Pick a catalog slug from: ${allowedTypes.join(', ')}.`,
      )
    }
    if (!hasProduct && ugcClipRequiresProduct(scene.type)) {
      issues.push(
        `Scene ${n} (${scene.type}) needs a product, but none was selected. Use a creator-led catalog type instead.`,
      )
    }
    if (!scene.imagePrompt || !scene.videoPrompt) {
      issues.push(`Scene ${n} (${scene.type}) is missing its image or video prompt.`)
    }
    if (ugcClipRequiresScript(scene.type) && !scene.script.trim()) {
      issues.push(`Scene ${n} (${scene.type}) is missing its spoken script.`)
    }
  })

  const customCount = scenes.filter(scene => scene.type === 'custom').length
  if (customCount > 1) {
    issues.push(
      'Use custom at most once, and only when no standard catalog type fits. Remap extra custom scenes to the closest catalog slug.',
    )
  }

  const onlyType = scenes[0]?.type
  if (scenes.length >= 2 && onlyType && scenes.every(scene => scene.type === onlyType)) {
    issues.push(
      `Do not repeat the same catalog type (${onlyType}) for every scene. Mix types — e.g. talking → demo → cta.`,
    )
  }

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

  const hasProduct = ugcAdPlanHasProduct(input.product)
  const allowedTypes = ugcPlannableClipTypes({
    hasProduct,
    productKind: input.product?.kind,
  })
  const allowed = new Set(allowedTypes)
  const schema = ugcAdPlanSchema(allowedTypes)

  const { model, system } = resolvePrompt(PROMPT_KEYS.ugcAdPlan, input.systemOverride)
  const baseMessages = buildUgcAdPlanMessages({
    ...input,
    description,
    influencerImageUrl,
    allowedTypes,
    hasProduct,
  })

  const generate = (messages: ModelMessage[]) =>
    generateObject({
      model,
      schema,
      system,
      temperature: 0.7,
      messages,
    })

  const toScenes = (generated: GeneratedScene[]) =>
    applyCatalogNames(
      generated.flatMap(scene => {
        const next = normalizeScene(scene, allowed)
        return next ? [next] : []
      }),
    )

  let result = await generate(baseMessages)
  let scenes = toScenes(result.object.scenes)
  const issues = sceneIssues(scenes, allowedTypes, hasProduct)

  if (issues.length > 0) {
    result = await generate([
      ...baseMessages,
      {
        role: 'user',
        content: `${issues.join(' ')} Fix and return the full plan again. type must be a catalog slug, never a made-up scene title.`,
      },
    ])
    scenes = toScenes(result.object.scenes)
  }

  const usable = scenes.filter(
    scene =>
      allowed.has(scene.type) &&
      scene.imagePrompt &&
      scene.videoPrompt &&
      (hasProduct || !ugcClipRequiresProduct(scene.type)),
  )
  if (usable.length === 0) {
    throw new Error('Planner returned no usable scenes')
  }
  if (usable.some(scene => ugcClipRequiresScript(scene.type) && !scene.script.trim())) {
    throw new Error('Planner returned scenes without scripts')
  }

  return {
    concept: result.object.concept.trim(),
    format: result.object.format,
    targetAudience: result.object.targetAudience.trim(),
    scenes: applyCatalogNames(usable),
  }
}
