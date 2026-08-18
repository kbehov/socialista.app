import { SYSTEM_CATEGORIES, SYSTEM_SKILLS } from '@socialista/ai'
import { connectDb, disconnectDb, syncSystemCategories, syncSystemSkills } from '@socialista/db'

async function main() {
  await connectDb()
  try {
    const categories = await syncSystemCategories(SYSTEM_CATEGORIES)
    console.log(
      `Synced ${SYSTEM_CATEGORIES.length} system categories (${categories} upserted or updated)`,
    )
    const skills = await syncSystemSkills(SYSTEM_SKILLS)
    console.log(`Synced ${SYSTEM_SKILLS.length} system skills (${skills} upserted or updated)`)
  } finally {
    await disconnectDb()
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
