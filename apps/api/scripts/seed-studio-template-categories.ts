import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

import {
  connectDb,
  disconnectDb,
  syncStudioTemplateCategoryTemplatesCount,
  upsertStudioTemplateCategoryByName,
} from '@socialista/db'
import { STUDIO_TEMPLATE_MANAGED_KIND_VALUES } from '@socialista/types'

type CategoriesSeedFile = {
  categories: string[]
}

const dir = dirname(fileURLToPath(import.meta.url))

config({ path: resolve(dir, '../.env') })

function loadCategoryNames(): string[] {
  const path = resolve(dir, 'templates-categories-seed.json')
  const parsed = JSON.parse(readFileSync(path, 'utf-8')) as unknown
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as CategoriesSeedFile).categories)) {
    throw new Error('templates-categories-seed.json must be { "categories": [ "Category name", ... ] }')
  }

  const names: string[] = []
  const seen = new Set<string>()

  for (const entry of (parsed as CategoriesSeedFile).categories) {
    if (typeof entry !== 'string') {
      throw new Error('Each category must be a non-empty string name')
    }
    const name = entry.trim()
    if (!name) {
      throw new Error('Each category must be a non-empty string name')
    }
    if (seen.has(name)) {
      throw new Error(`Duplicate category name: ${name}`)
    }
    seen.add(name)
    names.push(name)
  }

  if (names.length === 0) {
    throw new Error('templates-categories-seed.json has no categories')
  }

  return names
}

async function main() {
  const names = loadCategoryNames()
  console.log(`Loaded ${names.length} categories from templates-categories-seed.json`)

  await connectDb()

  try {
    let upserted = 0

    for (const name of names) {
      for (const kind of STUDIO_TEMPLATE_MANAGED_KIND_VALUES) {
        const category = await upsertStudioTemplateCategoryByName(kind, name)
        const synced = await syncStudioTemplateCategoryTemplatesCount(kind, name)
        console.log(
          `[${kind}] ${name} (_id=${category._id.toString()}, slug=${category.slug}): templatesCount=${synced?.templatesCount ?? category.templatesCount}`,
        )
        upserted += 1
      }
    }

    console.log(
      `Done. upserted ${upserted} category records (${names.length} names × ${STUDIO_TEMPLATE_MANAGED_KIND_VALUES.length} kinds)`,
    )
  } finally {
    await disconnectDb()
  }
}

void main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
