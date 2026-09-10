import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { connectDb, disconnectDb } from '../connect.js'
import { PresetModel } from '../models/preset.model.js'
import { assertPresetSeeds, PRESET_SEEDS } from './preset-seeds.js'

function loadEnv() {
  const scriptDir = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    resolve(scriptDir, '../.env'),
    resolve(scriptDir, '../../../apps/api/.env'),
    resolve(scriptDir, '../../../.env'),
  ]
  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      process.loadEnvFile(envPath)
      return
    }
  }
}

async function main() {
  loadEnv()
  assertPresetSeeds()

  const prune = process.argv.includes('--prune')
  await connectDb()

  try {
    let created = 0
    let updated = 0

    for (const seed of PRESET_SEEDS) {
      const existing = await PresetModel.findOne({ kind: seed.kind, name: seed.name })
      if (existing) {
        await PresetModel.updateOne(
          { _id: existing._id },
          {
            $set: {
              description: seed.description,
              prompt: seed.prompt,
              image: seed.image,
              attachments: seed.attachments,
              active: seed.active,
              sortOrder: seed.sortOrder,
            },
          },
        )
        updated += 1
        continue
      }

      await PresetModel.create(seed)
      created += 1
    }

    let pruned = 0
    if (prune) {
      const keep = PRESET_SEEDS.map(seed => ({ kind: seed.kind, name: seed.name }))
      const result = await PresetModel.deleteMany({
        $nor: keep,
      })
      pruned = result.deletedCount
    }

    const byKind = PRESET_SEEDS.reduce<Record<string, number>>((acc, seed) => {
      acc[seed.kind] = (acc[seed.kind] ?? 0) + 1
      return acc
    }, {})

    console.log(
      `Presets: ${created} created, ${updated} updated${prune ? `, ${pruned} pruned` : ''}`,
    )
    console.log(
      `Catalog: ${Object.entries(byKind)
        .map(([kind, count]) => `${kind} ${count}`)
        .join(', ')}`,
    )
  } finally {
    await disconnectDb()
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
