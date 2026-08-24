/**
 * Compare the pinned baseline image system prompt against the live IMAGE_PROMPT_SYSTEM.
 *
 * Usage (from repo root):
 *   pnpm --filter @socialista/trigger exec tsx ../ai/scripts/eval-prompts.ts
 *   pnpm --filter @socialista/trigger exec tsx ../ai/scripts/eval-prompts.ts --generate
 *   pnpm --filter @socialista/trigger exec tsx ../ai/scripts/eval-prompts.ts --only sheep
 *
 * Env: AI_GATEWAY_API_KEY (required). FAL_KEY + EVAL_IMAGE_MODEL for --generate.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { generateText } from 'ai'

import { IMAGE_PROMPT_SYSTEM } from '../prompts/image.js'
import { BASELINE_IMAGE_PROMPT_SYSTEM } from './baseline-image-prompt.js'

type Brief = {
  id: string
  density: 'spec' | 'sketch' | 'seed'
  aspectRatio: '1:1' | '9:16' | '16:9'
  prompt: string
}

const BRIEFS: Brief[] = [
  {
    id: 'sheep',
    density: 'spec',
    aspectRatio: '1:1',
    prompt:
      'high-angle 35mm fashion composition reference of an adult female model wearing a simple full-coverage dark gray fashion outfit, sitting sideways on an old wooden chair in the middle of a misty green pasture, torso leaning slightly backward, one arm draped over the chair back, the other hand resting on her thigh, one leg bent beside the chair and the other elegantly extended across the wet grass, a calm white sheep grazing close to the chair, another sheep softly visible in the distance, entire model, chair and animals visible, camera positioned slightly above her, foggy hills, dark forest, muted olive and beige palette, soft overcast light, vintage analog grain, realistic anatomy and animal proportions, aesthetic, mood',
  },
  {
    id: 'lounge',
    density: 'seed',
    aspectRatio: '1:1',
    prompt: '1980s neo-deco cocktail lounge after hours, two coupe glasses on a black-glass table',
  },
  {
    id: 'cat',
    density: 'seed',
    aspectRatio: '1:1',
    prompt: 'cat knocking over a plant',
  },
  {
    id: 'serum',
    density: 'sketch',
    aspectRatio: '4:3',
    prompt: 'a glass serum bottle on a bathroom marble counter, morning window light, label facing camera',
  },
  {
    id: 'portrait',
    density: 'sketch',
    aspectRatio: '9:16',
    prompt: 'adult man in a linen shirt standing in a sunlit kitchen, 85mm, looking just off camera',
  },
  {
    id: 'flat-illustration',
    density: 'sketch',
    aspectRatio: '1:1',
    prompt: 'flat gouache illustration of a bicycle leaning against a bakery window, five-color palette',
  },
  {
    id: 'food',
    density: 'sketch',
    aspectRatio: '1:1',
    prompt: 'bowl of ramen on a worn wooden table, steam rising, chopsticks resting on the rim',
  },
  {
    id: 'ref-composite',
    density: 'sketch',
    aspectRatio: '9:16',
    prompt: 'the person from @image1 holding the product from @image2 in a grocery aisle',
  },
  {
    id: 'product-catalog',
    density: 'sketch',
    aspectRatio: '1:1',
    prompt: 'studio catalog shot of white sneakers on a seamless backdrop, even tent lighting',
  },
  {
    id: 'street',
    density: 'seed',
    aspectRatio: '16:9',
    prompt: 'rainy tokyo street at night',
  },
]

const DESTINATION: Record<Brief['aspectRatio'], string> = {
  '9:16': 'tall vertical — Instagram Stories and Reels, TikTok, Pinterest pins',
  '1:1': 'square — Instagram and LinkedIn feed post, seen as a small grid thumbnail',
  '16:9': 'wide landscape — LinkedIn, X, and YouTube-style link cards',
  '4:3': 'landscape — feed post and link preview',
}

function loadEnv() {
  const roots = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(process.cwd(), '../../apps/web/.env'),
    resolve(process.cwd(), '../../packages/trigger/.env'),
    resolve(process.cwd(), '../trigger/.env'),
  ]
  for (const file of roots) {
    if (!existsSync(file)) continue
    for (const raw of readFileSync(file, 'utf8').split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq < 1) continue
      const key = line.slice(0, eq).trim()
      if (process.env[key]) continue
      let value = line.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  }
}

function parseArgs(argv: string[]) {
  const generate = argv.includes('--generate')
  const onlyIdx = argv.indexOf('--only')
  const onlyRaw = onlyIdx >= 0 ? argv[onlyIdx + 1] : undefined
  const only = onlyRaw ? new Set(onlyRaw.split(',').map(id => id.trim()).filter(Boolean)) : undefined
  return { generate, only }
}

async function enhance(system: string, brief: Brief, targetModel: string) {
  const { text } = await generateText({
    model: 'openai/gpt-5.6-terra',
    system,
    temperature: 0.4,
    messages: [
      {
        role: 'user',
        content: [
          brief.prompt,
          `Destination format: ${DESTINATION[brief.aspectRatio]}.`,
          `Target image model: ${targetModel}. Write in the prompt format this model responds to best.`,
        ].join('\n\n'),
      },
    ],
  })
  return text.trim()
}

async function maybeGenerate(prompt: string, model: string, aspectRatio: Brief['aspectRatio']) {
  const { generateImageFal } = await import('../providers/fal.js')
  const urls = await generateImageFal({
    model,
    prompt,
    aspectRatio,
    workspaceId: 'eval',
    userId: 'eval',
    numImages: 1,
  })
  return urls[0]
}

function divider(title: string) {
  console.log(`\n${'='.repeat(72)}\n${title}\n${'='.repeat(72)}`)
}

async function main() {
  loadEnv()
  const { generate, only } = parseArgs(process.argv.slice(2))
  const targetModel = process.env.EVAL_IMAGE_MODEL ?? 'fal-ai/flux/dev'
  const briefs = only ? BRIEFS.filter(brief => only.has(brief.id)) : BRIEFS

  if (briefs.length === 0) {
    throw new Error(`No briefs matched --only ${[...only ?? []].join(',')}`)
  }
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error('AI_GATEWAY_API_KEY is required')
  }
  if (generate && !process.env.FAL_KEY) {
    throw new Error('FAL_KEY is required for --generate')
  }

  for (const brief of briefs) {
    divider(`${brief.id}  [${brief.density}]  ${brief.aspectRatio}`)
    console.log('BRIEF')
    console.log(brief.prompt)

    const [oldPrompt, newPrompt] = await Promise.all([
      enhance(BASELINE_IMAGE_PROMPT_SYSTEM, brief, targetModel),
      enhance(IMAGE_PROMPT_SYSTEM, brief, targetModel),
    ])

    console.log('\nOLD')
    console.log(oldPrompt)
    console.log('\nNEW')
    console.log(newPrompt)

    if (!generate) continue

    const [oldUrl, newUrl] = await Promise.all([
      maybeGenerate(oldPrompt, targetModel, brief.aspectRatio),
      maybeGenerate(newPrompt, targetModel, brief.aspectRatio),
    ])
    console.log('\nOLD IMAGE')
    console.log(oldUrl)
    console.log('\nNEW IMAGE')
    console.log(newUrl)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
