import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import sharp from 'sharp'

import { uploadBufferToR2 } from '../src/lib/aws.js'
import { downloadImage } from '../src/utils/download-image.js'
import {
  connectDb,
  createStaticAdTemplate,
  disconnectDb,
  getStaticAdTemplateBySourceUrl,
  syncCategoryTemplatesCount,
  upsertStaticAdTemplateCategoryByName,
} from '@socialista/db'

type TemplateSeed = {
  image: string
  categories: string[]
}

const CONCURRENCY = 5
const dir = dirname(fileURLToPath(import.meta.url))

config({ path: resolve(dir, '../.env') })

function loadSeeds(): TemplateSeed[] {
  const path = resolve(dir, '../templates.json')
  if (!existsSync(path)) {
    throw new Error(`templates.json not found at ${path}`)
  }
  const parsed = JSON.parse(readFileSync(path, 'utf-8')) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('templates.json must be an array')
  }
  return parsed.filter((entry): entry is TemplateSeed => {
    return (
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as TemplateSeed).image === 'string' &&
      Array.isArray((entry as TemplateSeed).categories)
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

async function importTemplate(seed: TemplateSeed): Promise<'created' | 'skipped'> {
  const existing = await getStaticAdTemplateBySourceUrl(seed.image)
  if (existing) return 'skipped'

  const buffer = await downloadImage(seed.image)
  const compressed = await sharp(buffer).webp({ quality: 80 }).toBuffer()
  const key = `static-ad-templates/${crypto.randomUUID()}.webp`
  const imageUrl = await uploadBufferToR2(key, compressed, 'image/webp')
  const categories = [...new Set(seed.categories.map(name => name.trim()).filter(Boolean))]

  await createStaticAdTemplate({
    imageUrl,
    sourceImageUrl: seed.image,
    categories,
    name: nameFromSourceUrl(seed.image),
  })

  return 'created'
}

async function main() {
  const seeds = loadSeeds()
  console.log(`Loaded ${seeds.length} templates from templates.json`)

  await connectDb()

  try {
    const categoryNames = [
      ...new Set(seeds.flatMap(seed => seed.categories.map(name => name.trim()).filter(Boolean))),
    ]

    for (const name of categoryNames) {
      const category = await upsertStaticAdTemplateCategoryByName(name)
      console.log(`Category ${category.name}: ${category._id.toString()} (${category.templatesCount} existing)`)
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

    for (const name of categoryNames) {
      const updated = await syncCategoryTemplatesCount(name)
      console.log(`Synced ${name}: templatesCount=${updated?.templatesCount ?? 0}`)
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
