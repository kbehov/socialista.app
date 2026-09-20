import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import sharp from 'sharp'

import { uploadBufferToR2 } from '../src/lib/aws.js'
import { downloadImage } from '../src/utils/download-image.js'
import {
  connectDb,
  createStudioTemplate,
  disconnectDb,
  getStudioTemplateBySourceUrl,
  syncStudioTemplateCategoryTemplatesCount,
  upsertStudioTemplateCategoryByName,
  type CreateStudioTemplateInput,
} from '@socialista/db'
import { isStudioTemplateKind, StudioTemplateKind } from '@socialista/types'

/**
 * Seed format (apps/api/studio-templates.json):
 * [
 *   {
 *     "kind": "image" | "video" | "ugc" | "slideshow",
 *     "image": "https://source/preview.jpg",      // preview, re-uploaded to R2 as webp
 *     "categories": ["Product showcase"],
 *     "name": "Optional display name",
 *     "description": "Optional blurb shown in the preview dialog",
 *     "payload": {
 *       // image: { prompt, model?, aspectRatio?, referenceImageUrls? }
 *       // video: { prompt, model?, aspectRatio?, durationSec?, resolution?, generateAudio?, referenceImageUrl? }
 *       // ugc: { aspectRatio?, models?, script?, directions?, clips: [{ type, name?, durationSec?, sceneCount?, script?, scenePrompt?, directions?, imagePrompt? }] }
 *       // slideshow: { canvas, aspectRatioId, slides }  // slide/layer image URLs stored as-is
 *     }
 *   }
 * ]
 */
type StudioTemplateSeed = {
  kind: StudioTemplateKind
  image: string
  categories: string[]
  name?: string
  description?: string
  payload: Record<string, unknown>
}

function isValidSeedPayload(kind: StudioTemplateKind, payload: Record<string, unknown>): boolean {
  if (kind === StudioTemplateKind.IMAGE || kind === StudioTemplateKind.VIDEO) {
    return payload.prompt === undefined || typeof payload.prompt === 'string'
  }
  if (kind === StudioTemplateKind.UGC) {
    return Array.isArray(payload.clips)
  }
  if (kind === StudioTemplateKind.SLIDESHOW) {
    return Array.isArray(payload.slides)
  }
  return false
}

const CONCURRENCY = 5
const dir = dirname(fileURLToPath(import.meta.url))

config({ path: resolve(dir, '../.env') })

function loadSeeds(): StudioTemplateSeed[] {
  const path = resolve(dir, '../studio-templates.json')
  if (!existsSync(path)) {
    throw new Error(`studio-templates.json not found at ${path}`)
  }
  const parsed = JSON.parse(readFileSync(path, 'utf-8')) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('studio-templates.json must be an array')
  }
  return parsed.filter((entry): entry is StudioTemplateSeed => {
    if (typeof entry !== 'object' || entry === null) return false
    const seed = entry as Partial<StudioTemplateSeed>
    return (
      isStudioTemplateKind(seed.kind) &&
      typeof seed.image === 'string' &&
      Array.isArray(seed.categories) &&
      typeof seed.payload === 'object' &&
      seed.payload !== null &&
      !Array.isArray(seed.payload) &&
      isValidSeedPayload(seed.kind, seed.payload as Record<string, unknown>)
    )
  })
}

function nameFromSourceUrl(url: string): string {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname)
    const base = pathname.split('/').pop() ?? 'template'
    return base.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'template'
  } catch {
    return 'template'
  }
}

async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let next = 0
  const workerCount = Math.max(1, Math.min(concurrency, items.length))

  async function worker() {
    while (next < items.length) {
      const index = next
      next += 1
      const item = items[index]
      if (item === undefined) continue
      await fn(item, index)
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()))
}

async function importTemplate(seed: StudioTemplateSeed): Promise<'created' | 'skipped'> {
  const existing = await getStudioTemplateBySourceUrl(seed.image)
  if (existing) return 'skipped'

  const buffer = await downloadImage(seed.image)
  const compressed = await sharp(buffer).webp({ quality: 80 }).toBuffer()
  const key = `studio-templates/${seed.kind}/${crypto.randomUUID()}.webp`
  const previewImageUrl = await uploadBufferToR2(key, compressed, 'image/webp')
  const categories = [...new Set(seed.categories.map(name => name.trim()).filter(Boolean))]

  await createStudioTemplate({
    kind: seed.kind,
    categories,
    previewImageUrl,
    sourceImageUrl: seed.image,
    payload: seed.payload as CreateStudioTemplateInput['payload'],
    name: seed.name ?? nameFromSourceUrl(seed.image),
    description: seed.description,
  })

  return 'created'
}

async function main() {
  const seeds = loadSeeds()
  console.log(`Loaded ${seeds.length} studio templates from studio-templates.json`)

  await connectDb()

  try {
    const categoryKeys = [
      ...new Map(
        seeds.flatMap(seed =>
          seed.categories
            .map(name => name.trim())
            .filter(Boolean)
            .map(name => [`${seed.kind}:${name}`, { kind: seed.kind, name }] as const),
        ),
      ).values(),
    ]

    for (const { kind, name } of categoryKeys) {
      const category = await upsertStudioTemplateCategoryByName(kind, name)
      console.log(`Category [${kind}] ${category.name}: ${category._id.toString()} (${category.templatesCount} existing)`)
    }

    let created = 0
    let skipped = 0
    let failed = 0

    await mapPool(seeds, CONCURRENCY, async (seed, index) => {
      try {
        const result = await importTemplate(seed)
        if (result === 'created') created += 1
        else skipped += 1
        if ((index + 1) % 25 === 0 || index + 1 === seeds.length) {
          console.log(`Progress ${index + 1}/${seeds.length} (created=${created} skipped=${skipped} failed=${failed})`)
        }
      } catch (error) {
        failed += 1
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Failed ${seed.image}: ${message}`)
      }
    })

    for (const { kind, name } of categoryKeys) {
      const updated = await syncStudioTemplateCategoryTemplatesCount(kind, name)
      console.log(`Synced [${kind}] ${name}: templatesCount=${updated?.templatesCount ?? 0}`)
    }

    console.log(`Done. created=${created} skipped=${skipped} failed=${failed}`)
  } finally {
    await disconnectDb()
  }
}

void main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
