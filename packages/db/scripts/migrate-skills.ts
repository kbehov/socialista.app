import { connectDb, disconnectDb } from '../connect.js'
import { SkillModel } from '../models/skill.model.js'
import { PROMPT_KEY_VALUES, type PromptKey } from '@socialista/types'
import type { Document, ObjectId } from 'mongodb'

const SLOT_TO_TARGET: Record<string, PromptKey> = {
  'image-prompt-enhance': 'image-prompt',
  'video-prompt-enhance': 'video-prompt',
  'static-ad-vision': 'static-ad',
  'ugc-video-planner': 'ugc-video-planner',
  'ugc-ad-script': 'ugc-ad-script',
  'video-script': 'video-script',
  slideshow: 'slideshow',
  'post-copywriter': 'post-copy',
}

const BINDING_TO_TARGET: Record<string, PromptKey> = {
  image: 'image-prompt',
  video: 'video-prompt',
  text: 'post-copy',
}

function isPromptKey(value: unknown): value is PromptKey {
  return typeof value === 'string' && (PROMPT_KEY_VALUES as string[]).includes(value)
}

function resolveTarget(doc: Document): { target: PromptKey; fallback: boolean } {
  if (isPromptKey(doc.target)) return { target: doc.target, fallback: false }
  if (typeof doc.slot === 'string' && SLOT_TO_TARGET[doc.slot]) {
    return { target: SLOT_TO_TARGET[doc.slot], fallback: false }
  }
  if (typeof doc.binding === 'string' && BINDING_TO_TARGET[doc.binding]) {
    return { target: BINDING_TO_TARGET[doc.binding], fallback: true }
  }
  return { target: 'image-prompt', fallback: true }
}

async function main() {
  await connectDb()
  const db = SkillModel.db
  const skills = db.collection('skills')

  try {
    await db.collection('skillcategories').drop()
    console.log('Dropped skillcategories collection')
  } catch {
    console.log('skillcategories collection already gone')
  }

  const { deletedCount: systemDeleted } = await skills.deleteMany({
    $or: [{ source: 'system' }, { workspaceId: null }],
  })
  console.log(`Deleted ${systemDeleted} system/global skills`)

  const { deletedCount: archivedDeleted } = await skills.deleteMany({ status: 'archived' })
  console.log(`Deleted ${archivedDeleted} archived skills`)

  const remaining = await skills.find({}).toArray()
  const fallbackIds: string[] = []

  for (const doc of remaining) {
    const { target, fallback } = resolveTarget(doc)
    const id = (doc._id as ObjectId).toString()
    if (fallback) fallbackIds.push(id)
    await skills.updateOne({ _id: doc._id }, { $set: { target } })
  }

  await skills.updateMany(
    {},
    {
      $unset: {
        categoryId: '',
        binding: '',
        slot: '',
        variables: '',
        outputSchema: '',
        toolBindings: '',
        source: '',
        forkedFrom: '',
        status: '',
        version: '',
        modelConfig: '',
        visibility: '',
      },
    },
  )

  if (fallbackIds.length > 0) {
    console.log(`Assigned fallback target to ${fallbackIds.length} skills: ${fallbackIds.join(', ')}`)
  }

  console.log(`Migrated ${remaining.length} workspace skills`)
  await disconnectDb()
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
