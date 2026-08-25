import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Types } from 'mongoose'

import { connectDb, disconnectDb } from '../connect.js'
import { AccountModel } from '../models/account.model.js'
import { GenerationModel } from '../models/generation.model.js'
import { InfluencerModel } from '../models/influencer.model.js'
import { PostModel } from '../models/post.model.js'
import { ProductModel } from '../models/product.model.js'
import { ProjectModel } from '../models/project.model.js'
import { SlideshowModel } from '../models/slideshow.model.js'
import { UgcProjectModel } from '../models/ugc-project.model.js'
import { VideoModel } from '../models/video.model.js'
import { WorkspaceModel } from '../models/workspace.model.js'
import { ProjectStatus } from '../types/project.types.js'

const MISSING_PROJECT = [{ project: { $exists: false } }, { project: null }]

type ChildModel = {
  name: string
  model: {
    updateMany: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
    ) => Promise<{ modifiedCount: number }>
  }
  workspaceField: 'workspace' | 'workspaceId'
}

function loadEnv() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env')
  if (!existsSync(envPath)) return
  process.loadEnvFile(envPath)
}

const CHILD_MODELS: ChildModel[] = [
  { name: 'accounts', model: AccountModel, workspaceField: 'workspace' },
  { name: 'posts', model: PostModel, workspaceField: 'workspace' },
  { name: 'generations', model: GenerationModel, workspaceField: 'workspace' },
  { name: 'videos', model: VideoModel, workspaceField: 'workspace' },
  { name: 'slideshows', model: SlideshowModel, workspaceField: 'workspace' },
  { name: 'ugcprojects', model: UgcProjectModel, workspaceField: 'workspace' },
  { name: 'products', model: ProductModel, workspaceField: 'workspaceId' },
  { name: 'influencers', model: InfluencerModel, workspaceField: 'workspace' },
]

async function backfill(
  child: ChildModel,
  workspaceId: Types.ObjectId | string,
  projectId: Types.ObjectId,
): Promise<number> {
  const result = await child.model.updateMany(
    {
      [child.workspaceField]: workspaceId,
      $or: MISSING_PROJECT,
    },
    { $set: { project: projectId } },
  )
  return result.modifiedCount
}

async function main() {
  loadEnv()
  await connectDb()

  try {
    const workspaces = await WorkspaceModel.find().select('name ownerId settings').lean()
    console.log(`Found ${workspaces.length} workspaces`)

    let created = 0
    let reused = 0
    let timezoneBackfilled = 0

    for (const workspace of workspaces) {
      const timezone = workspace.settings?.timezone?.trim() || 'UTC'
      const existing = await ProjectModel.findOne({ workspace: workspace._id, isDefault: true })

      const project =
        existing ??
        (await ProjectModel.create({
          workspace: workspace._id,
          name: workspace.name?.trim() || 'Default project',
          timezone,
          status: ProjectStatus.ACTIVE,
          isDefault: true,
          createdBy: workspace.ownerId,
        }))

      if (existing) {
        reused += 1
        if (!existing.timezone) {
          await ProjectModel.updateOne({ _id: existing._id }, { $set: { timezone } })
          timezoneBackfilled += 1
        }
      } else {
        created += 1
      }

      for (const child of CHILD_MODELS) {
        const modifiedCount = await backfill(child, workspace._id, project._id)
        if (modifiedCount > 0) {
          console.log(`  ${child.name}: backfilled ${modifiedCount} docs for workspace ${workspace._id.toString()}`)
        }
      }
    }

    const missingTimezone = await ProjectModel.find({
      $or: [{ timezone: { $exists: false } }, { timezone: null }, { timezone: '' }],
    }).lean()

    for (const project of missingTimezone) {
      const workspace = await WorkspaceModel.findById(project.workspace).select('settings').lean()
      await ProjectModel.updateOne(
        { _id: project._id },
        { $set: { timezone: workspace?.settings?.timezone?.trim() || 'UTC' } },
      )
      timezoneBackfilled += 1
    }

    console.log(
      `Created ${created} default projects, reused ${reused}, backfilled timezone on ${timezoneBackfilled}`,
    )
  } finally {
    await disconnectDb()
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
