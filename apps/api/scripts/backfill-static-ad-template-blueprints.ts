import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { connectDb, disconnectDb, listStaticAdTemplatesMissingBlueprint } from '@socialista/db'
import { config } from 'dotenv'

import { enqueueStaticAdTemplateAnalysis } from './enqueue-static-ad-template-analysis.js'

const BATCH = 2000
const CONCURRENCY = 8
const dir = dirname(fileURLToPath(import.meta.url))

config({ path: resolve(dir, '../.env') })

async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0
  const workerCount = Math.max(1, Math.min(concurrency, items.length))

  async function worker() {
    while (next < items.length) {
      const index = next
      next += 1
      const item = items[index]
      if (item === undefined) continue
      await fn(item)
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()))
}

async function main() {
  await connectDb()

  try {
    const templates = await listStaticAdTemplatesMissingBlueprint(BATCH)
    console.log(`Found ${templates.length} templates without a blueprint`)

    let enqueued = 0
    let failed = 0

    await mapPool(templates, CONCURRENCY, async template => {
      try {
        await enqueueStaticAdTemplateAnalysis(template._id.toString())
        enqueued += 1
      } catch (error) {
        failed += 1
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Failed ${template._id.toString()}: ${message}`)
      }
    })

    console.log(`Done. enqueued=${enqueued} failed=${failed}`)
    if (templates.length === BATCH) {
      console.log('Batch was full. Re-run after those analyses finish to enqueue the rest.')
    }
  } finally {
    await disconnectDb()
  }
}

void main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
