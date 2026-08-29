import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CREDITS_PER_USD, usdToCredits } from '@socialista/types'

import { connectDb, disconnectDb } from '../connect.js'
import { GenerationModel } from '../models/generation.model.js'
import { ModelModel } from '../models/model.js'
import { WorkspaceModel } from '../models/workspace.model.js'

const MIGRATION_ID = 'usd-to-credits-x100'

type MigrationRecord = {
  _id: string
  status: 'running' | 'completed'
  startedAt: Date
  completedAt?: Date
}

function loadEnv() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env')
  if (!existsSync(envPath)) return
  process.loadEnvFile(envPath)
}

function scaleField(field: string) {
  return {
    $round: [{ $multiply: [{ $ifNull: [`$${field}`, 0] }, CREDITS_PER_USD] }, 1],
  }
}

async function main() {
  loadEnv()
  await connectDb()

  console.log(`Converting USD → credits at $1 = ${usdToCredits(1)} credits (×${CREDITS_PER_USD})`)

  const migrations = WorkspaceModel.db.collection<MigrationRecord>('migrations')
  const existing = await migrations.findOne({ _id: MIGRATION_ID })
  if (existing?.status === 'completed') {
    console.log(`Migration ${MIGRATION_ID} already completed at ${existing.completedAt?.toISOString()}`)
    await disconnectDb()
    return
  }

  await migrations.updateOne(
    { _id: MIGRATION_ID },
    { $set: { status: 'running', startedAt: new Date() } },
    { upsert: true },
  )

  const workspaces = await WorkspaceModel.collection.updateMany({}, [
    { $set: { 'billing.aiCreditsBalance': scaleField('billing.aiCreditsBalance') } },
  ])
  console.log(`Workspaces: matched ${workspaces.matchedCount}, modified ${workspaces.modifiedCount}`)

  const models = await ModelModel.collection.updateMany({}, [{ $set: { cost: scaleField('cost') } }])
  console.log(`Models: matched ${models.matchedCount}, modified ${models.modifiedCount}`)

  const generations = await GenerationModel.collection.updateMany({}, [
    {
      $set: {
        cost: scaleField('cost'),
        creditsCharged: scaleField('creditsCharged'),
      },
    },
  ])
  console.log(`Generations: matched ${generations.matchedCount}, modified ${generations.modifiedCount}`)

  await migrations.updateOne(
    { _id: MIGRATION_ID },
    { $set: { status: 'completed', completedAt: new Date() } },
  )
  console.log(`Migration ${MIGRATION_ID} completed`)

  await disconnectDb()
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
